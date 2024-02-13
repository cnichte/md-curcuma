/**
 * MD_Exporter
 * 
 * @author Carsten Nichte
 */
import * as fs from "fs";
import { MD_Filesystem } from "./md-filesystem";
import { MD_Transformer_Interface } from "./md-transformer";
import { MD_Transformer_Factory } from "./md-transformer-factory";
import { MD_Job_Type, MD_JobTasks_Type } from "./md-job";
import { MD_Frontmatter_Mapper } from "./md-frontmatter";
import { MD_Observer_Interface } from "./md-observer";

export enum MD_EXPORTER_COMMANDS {
  DO_NOT_WRITE_FILES = "do-not-write-file"
}

export interface MD_Exporter_Parameter_Type {
  readPath: string; // Datei oder Verzeichnis
  writePath: string; // Verzeichnis
  simulate: boolean;
  doSubfolders: boolean;
  limit: number; // greift nur bei Verzeichnis
  useCounter: boolean;
}

/**
 ** Processes one or many files, and applies the transformers on each.
 *
 * @export
 * @class MD_Exporter
 */
export class MD_Exporter implements MD_Observer_Interface {
  private transformers: Array<MD_Transformer_Interface> = [];
  private do_not_write_file: boolean = false;

  /**
   * Register a Transformer.
   *
   * @param {MD_Transformer_Interface} t
   * @memberof MD_Splitter
   */
  public addTransformer(t: MD_Transformer_Interface): void {
    this.transformers.push(t);
  }

  /**
   * implementing of the MD_Observer_Interface.
   * MD_Exporter listens to messages from the transformers.
   */
  do_command(from:string, to: string, command: string,): void {
    if (command === MD_EXPORTER_COMMANDS.DO_NOT_WRITE_FILES) {
      this.do_not_write_file = true;
    }
  }

  /**
   ** Runs a job.
   *
   * @param {MD_Exporter_Parameter_Type} job_parameter
   * @memberof MD_Exporter
   */
  public perform_job(job_parameter: MD_Exporter_Parameter_Type): void {
    if (MD_Filesystem.isFolder(job_parameter.readPath)) {
      var file_list: Array<string> = MD_Filesystem.get_files_list(
        job_parameter.readPath
      );

      console.log(file_list);

      file_list.forEach((file: string) => {
        this.transform_and_write(
          file,
          job_parameter,
          MD_Filesystem.read_file(file)
        );
      });
    } else if (MD_Filesystem.isFile(job_parameter.readPath)) {
      this.transform_and_write(
        job_parameter.readPath,
        job_parameter,
        MD_Filesystem.read_file(job_parameter.readPath)
      );
    } else {
      console.log(`not supported: '${job_parameter.readPath}'`);
    }
  }

  /**
   * Transform and write a markdown document.
   * I look at each paragraph individually.
   *
   * @private
   * @param {string } source_file
   * @param {MD_Exporter_Parameter_Type} job_parameter
   * @param {Array<string>} md_content
   * @memberof MD_Exporter
   */
  private transform_and_write(
    source_file: string,
    job_parameter: MD_Exporter_Parameter_Type,
    md_content: string
  ): void {
    // TODO analysiere Quelle (und Ziel) auf Frontmatter
    const fmm = new MD_Frontmatter_Mapper("", "");
    if (fmm.has_frontmatter(md_content)) {
      console.log("###########################");
      console.log("SOURCE FILE HAS FRONTMATTER");
      console.log("###########################");
    }

    var md_content_array: Array<string> = md_content.split("\n");

    // I use the transformers on every paragraph.
    for (let transformer of this.transformers) {

      transformer.set_job_parameter(job_parameter);

      // listen to messages from the transformers
      transformer.addObserver(this);

      for (var i = 0; i < md_content_array.length; i++) {
        transformer.transform(md_content_array, i);
      }
    }

    // TODO I don't actually want to write the entire file when splitting.
    // TODO perhaps i want to transform also the filename.
    const filename = MD_Filesystem.get_filename_from(source_file);

    const path_target_filename = MD_Filesystem.concat_path_filename(
      job_parameter.writePath,
      filename
    );

    MD_Filesystem.ensure_path(job_parameter.writePath, job_parameter.simulate);

    if (!job_parameter.simulate) {
      // Here, of course, the option of forcing the disk can be useful.
      if(!this.do_not_write_file){
        if (MD_Filesystem.is_file_modified(source_file, path_target_filename)) {
          MD_Filesystem.write_file(
            path_target_filename,
            md_content_array.join("\n")
          );
        }
      }

    } else {
      console.log("###########################");
      console.log(source_file);
      console.log(path_target_filename);
      console.log(
        `modified:  ${MD_Filesystem.is_file_modified(
          source_file,
          path_target_filename
        )}`
      );
      console.log("###########################");
    }
  }

  /**
   ** Runs a job from a config file.
   * TODO pass custom transformer-factory as parameter
   * TODO or move the factory to the base class of the transformer?
   *
   * @param {string} config_file
   * @param {string} job_name
   * @memberof MD_Exporter
   */
  public perform_job_from(config_file: string, job_name: string) {
    let jsonData = JSON.parse(fs.readFileSync(config_file, "utf8")); // TODO auch ins FileSystem

    var the_job: MD_Job_Type = null;

    jsonData.job_list.forEach((job: MD_Job_Type) => {
      if (job.job_name === job_name) {
        the_job = job;
      }
    });

    if (the_job != null) {
      console.log(`prepare job '${the_job.job_name}'`);

      let job_parameter: MD_Exporter_Parameter_Type = the_job.job_parameter;

      let job_tasks: Array<MD_JobTasks_Type> = the_job.job_tasks;

      job_tasks.forEach((job_task: MD_JobTasks_Type) => {
        // MD_Transformer_Interface actually
        let transformer: any = new MD_Transformer_Factory(
          job_task.transformer_class_name,
          job_task.transformer_parameter
        );

        this.addTransformer(transformer);
      });

      this.perform_job(job_parameter);
    } else {
      console.log(`job '${the_job.job_name}' not found in '${config_file}'`);
    }
  }
}
