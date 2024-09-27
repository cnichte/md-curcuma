/**
 * XLSX_Transporter
 *
 * @author Carsten Nichte
 */
import * as fs from "fs";
import * as XLSX from "xlsx";

import { MD_Mapping } from "../md-mapping";
import { MD_Observer_Interface } from "../md-observer";
import { MD_Transporter_Parameter_Type } from "./md-transporter";
import { MD_Filesystem } from "../md-filesystem";
import { MD_Transformer_Interface } from "../md-transformer";
import { IOable, Transportable } from "../types";

export interface XLSX_Transporter_Parameter_Type extends IOable {
  // IOable
  readPath: string; // Datei oder Verzeichnis
  writePath: string; // Verzeichnis
  simulate: boolean;
  // the rest
  doSubfolders: boolean;
  limit: number;
  useCounter: boolean;
  mappings?: MD_Mapping[];
}

export class XLSX_Transporter
  implements
    Transportable<XLSX.WorkBook, XLSX_Transporter_Parameter_Type>,
    MD_Observer_Interface
{
  private transformers: Array<MD_Transformer_Interface> = [];
  private do_not_write_file: boolean = false;

  public perform_job(job_parameter: XLSX_Transporter_Parameter_Type): void {
    if (MD_Filesystem.isFolder(job_parameter.readPath)) {
      var file_list: Array<string> = MD_Filesystem.get_files_list(
        job_parameter.readPath
      );

      console.log(file_list);

      file_list.forEach((file: string) => {
        this.transform_and_write(
          file,
          job_parameter,
          MD_Filesystem.read_file_xlsx(file)
        );
      });
    } else if (MD_Filesystem.isFile(job_parameter.readPath)) {
      this.transform_and_write(
        job_parameter.readPath,
        job_parameter,
        MD_Filesystem.read_file_xlsx(job_parameter.readPath)
      );
    } else {
      console.log(`not supported: '${job_parameter.readPath}'`);
    }
  }

  transform_and_write(
    source_file: string,
    job_parameter: XLSX_Transporter_Parameter_Type,
    workbook: XLSX.WorkBook
  ) {
    // https://github.com/SheetJS/sheetjs
    // https://docs.sheetjs.com

    console.log(job_parameter.readPath);

    // Alle Sheets
    workbook.SheetNames.forEach((sheetName: string) => {
      console.log(sheetName);
      // process
      const sheet = workbook.Sheets[sheetName];
      //! https://docs.sheetjs.com/docs/getting-started/examples/import#extract-raw-data
      const sheetJSON = XLSX.utils.sheet_to_json(sheet); // , {header: 1}

      let mapping: any = [
        {
          sheetName: "",
          source_array_index: 0,
          source_property_name: "",
          target_property_name: "",
          target_type: "",
          tasks: [],
        },
      ];

      // save as json for test purposes
      fs.writeFileSync(
        `${job_parameter.writePath}_${sheetName}.json`,
        JSON.stringify(sheetJSON, null, 2)
      );
    }); // for each sheet

    MD_Filesystem.write_my_file<XLSX.WorkBook, XLSX_Transporter_Parameter_Type>(
      source_file,
      job_parameter,
      workbook,
      false,
      (filename: string, data: XLSX.WorkBook) => {
        MD_Filesystem.write_file_xlsx(filename, data);
      }
    );

    // TODO I don't actually want to write the entire file when splitting.
    // TODO perhaps i want to transform also the filename.
    const filename = MD_Filesystem.get_filename_from(source_file);

    const path_target_filename = MD_Filesystem.concat_path_filename(
      job_parameter.writePath,
      filename
    );

    MD_Filesystem.ensure_path(job_parameter.writePath, job_parameter.simulate); // TODO that doesn't always work?

    if (!job_parameter.simulate) {
      // Here, of course, the option of forcing the disk can be useful.
      if (!this.do_not_write_file) {
        if (MD_Filesystem.is_file_exist(path_target_filename)) {
          if (
            MD_Filesystem.is_file_modified(source_file, path_target_filename)
          ) {
            console.log(
              "file does exist, and is modified (compared by modified-date): Write it."
            );
            MD_Filesystem.write_file_xlsx(path_target_filename, workbook);
          } else {
            console.log("file does exist, but is not modified: Skip writing.");
          }
        } else {
          console.log("file does not exist: Write it.");
          MD_Filesystem.write_file_xlsx(path_target_filename, workbook);
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

  perform_job_from(config_file: string, job_name: string): void {
    throw new Error("Method not implemented.");
  }

  do_command(from: string, to: string, command: string): void {
    throw new Error("Method not implemented.");
  }
}
