/**
 * XLSX_Transporter
 *
 * @author Carsten Nichte
 */
import * as fs from "fs";
import * as XLSX from "xlsx";

import { MD_Observer_Interface } from "../md-observer";
import { MD_Filesystem } from "../md-filesystem";
import { MD_Transformer_Interface } from "../md-transformer";
import { IOable, Transportable } from "../types";
import { Lodash_Wrapper } from "../lodash-wrapper";

export interface XLSX_Mapper_Item {
  sheet_name: string;
  source_property_name: string;
  target_poperty_name: string;
}
export interface XLSX_Mapper {
  mapping_items: XLSX_Mapper_Item[];
}

export interface XLSX_Transporter_Parameter_Type<T> extends IOable {
  // IOable
  readPath: string; // Datei oder Verzeichnis
  writePath: string; // Verzeichnis
  simulate: boolean;
  // the rest
  doSubfolders: boolean;
  limit: number;
  useCounter: boolean;
  json_template: T;
  mappings?: XLSX_Mapper[];
}

export class XLSX_Transporter<T>
  implements
    Transportable<XLSX.WorkBook, XLSX_Transporter_Parameter_Type<T>>,
    MD_Observer_Interface
{
  private transformers: Array<MD_Transformer_Interface> = [];
  private do_not_write_file: boolean = false;

  public perform_job(job_parameter: XLSX_Transporter_Parameter_Type<T>): void {
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
    job_parameter: XLSX_Transporter_Parameter_Type<T>,
    workbook: XLSX.WorkBook
  ) {
    // https://github.com/SheetJS/sheetjs
    // https://docs.sheetjs.com

    console.log(job_parameter.readPath);

    let json_object: any = job_parameter.json_template; // T

    job_parameter.mappings.forEach((map: XLSX_Mapper) => {
      map.mapping_items.forEach((item: XLSX_Mapper_Item) => {
        let sn = item.sheet_name;
        let spn = item.source_property_name;
        let tpn = item.target_poperty_name;

        const sheet = workbook.Sheets[sn];
        const v = sheet[spn]?.v;
        if (v !== null) {
          // nested property
          // https://dev.to/pffigueiredo/typescript-utility-keyof-nested-object-2pa3
          Lodash_Wrapper.set(json_object, tpn, v);
        }
      });
    });

    // TODO Das Objekt soll gefüllt zurückgegeben, aber nicht ins fs geschrieben werden.
    fs.writeFileSync(
      `${job_parameter.writePath}erster-test.json`,
      JSON.stringify(json_object, null, 2)
    );

    //! TEST-Start
    // Alle Sheets
    workbook.SheetNames.forEach((sheetName: string) => {
      console.log(sheetName);
      // process
      const sheet = workbook.Sheets[sheetName];
      // https://docs.sheetjs.com/docs/getting-started/examples/import#extract-raw-data
      const sheetJSON = XLSX.utils.sheet_to_json(sheet); // , {header: 1}

      // https://stackoverflow.com/questions/48816940/accessing-cells-with-sheetjs
      // https://docs.sheetjs.com/docs/csf/cell#content-and-presentation
      console.log(sheet["C7"].v); // Hallo Welt

      var col_index = XLSX.utils.decode_col("D");
      var col_name = XLSX.utils.encode_col(300);

      console.log(`Colname: ${col_name}`);

      // save as json for test purposes
      fs.writeFileSync(
        `${job_parameter.writePath}${sheetName}.json`,
        JSON.stringify(sheetJSON, null, 2)
      );
    }); // for each sheet

    // TODO Write JSON, not Workbook
    /*
    MD_Filesystem.write_my_file<XLSX.WorkBook, XLSX_Transporter_Parameter_Type>(
      source_file,
      job_parameter,
      workbook,
      false,
      (filename: string, data: XLSX.WorkBook) => {
        MD_Filesystem.write_file_xlsx(filename, data);
      }
    );
    */
    //! TEST-Ende
  }

  perform_job_from(config_file: string, job_name: string): void {
    throw new Error("Method not implemented.");
  }

  do_command(from: string, to: string, command: string): void {
    throw new Error("Method not implemented.");
  }
}
