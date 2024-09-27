/**
 * MD_Transporter
 *
 * @author Carsten Nichte
 */
import * as fs from "fs";
import { MD_FileContent_Interface, MD_Filesystem } from "../md-filesystem";
import { MD_Transformer_Interface } from "../md-transformer";
import { MD_Transformer_Factory } from "../md-transformer-factory";
import { MD_Job_Type, MD_JobTasks_Type } from "../md-job";
import { MD_Observer_Interface } from "../md-observer";
import { Transportable } from "../types";

export enum MD_TRANSPORTER_COMMANDS {
  DO_NOT_WRITE_FILES = "do-not-write-file",
}

export interface MD_Transporter_Parameter_Type {
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
export class MD_Transporter
  implements
    Transportable<string, MD_Transporter_Parameter_Type>,
    MD_Observer_Interface
{
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
  do_command(from: string, to: string, command: string): void {
    if (command === MD_TRANSPORTER_COMMANDS.DO_NOT_WRITE_FILES) {
      this.do_not_write_file = true;
    }
  }

  /**
   ** Runs a job.
   *
   * @param {MD_Transporter_Parameter_Type} job_parameter
   * @memberof MD_Exporter
   */
  public perform_job(job_parameter: MD_Transporter_Parameter_Type): void {
    if (MD_Filesystem.isFolder(job_parameter.readPath)) {
      var file_list: Array<string> = MD_Filesystem.get_files_list(
        job_parameter.readPath
      );

      console.log(file_list);

      file_list.forEach((file: string) => {
        this.transform_and_write(
          file,
          job_parameter,
          MD_Filesystem.read_file_txt(file)
        );
      });
    } else if (MD_Filesystem.isFile(job_parameter.readPath)) {
      this.transform_and_write(
        job_parameter.readPath,
        job_parameter,
        MD_Filesystem.read_file_txt(job_parameter.readPath)
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
   * @param {MD_Transporter_Parameter_Type} job_parameter
   * @param {Array<string>} md_content
   * @memberof MD_Exporter
   */
  transform_and_write(
    source_file: string,
    job_parameter: MD_Transporter_Parameter_Type,
    md_content: string
  ): void {
    // Trenne im md-content das Frontmatter vom body ab.
    const mdfc: MD_FileContent_Interface =
      MD_Filesystem.split_frontmatter_body(md_content);

    // I use the transformers on every paragraph.
    for (let transformer of this.transformers) {
      transformer.set_job_parameter(job_parameter);

      // listen to messages from the transformers
      transformer.addObserver(this);

      for (var i = 0; i < mdfc.body_array.length; i++) {
        mdfc.index = i;
        const test: MD_FileContent_Interface = transformer.transform(mdfc, i);
        if (test.index != i) i = test.index; // elements are added or removed
      }
    }

    // TODO I don't actually want to write the entire file when splitting.
    // TODO perhaps i want to transform also the filename.
    const filename = MD_Filesystem.get_filename_from(source_file);

    const path_target_filename = MD_Filesystem.concat_path_filename(
      job_parameter.writePath,
      filename
    );

    MD_Filesystem.write_my_file<
      MD_FileContent_Interface,
      MD_Transporter_Parameter_Type
    >(
      source_file,
      job_parameter,
      mdfc,
      this.do_not_write_file,
      (filename: string, data: MD_FileContent_Interface) => {
        MD_Filesystem.write_file_txt(
          filename,
          MD_Filesystem.merge_frontmatter_body(data)
        );
      }
    );
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
  public perform_job_from(config_file: string, job_name: string):void {
    let jsonData = JSON.parse(fs.readFileSync(config_file, "utf8")); // TODO auch ins FileSystem

    var the_job: MD_Job_Type = null;

    jsonData.job_list.forEach((job: MD_Job_Type) => {
      if (job.job_name === job_name) {
        the_job = job;
      }
    });

    if (the_job != null) {
      console.log(`prepare job '${the_job.job_name}'`);

      let job_parameter: MD_Transporter_Parameter_Type = the_job.job_parameter;

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
