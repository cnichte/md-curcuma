import { Filesystem } from "../core";
import { Data_Interface, IO_Meta_Interface } from "../io/types";
import { Observable_Abstract_TaskBase } from "./Observable_Abstract_TaskBase";

export interface Xlsx_Anlayse_Task_Props {
  write_path: string;
}

/**
 * Analyzes the XLSX-Json object to get the coordinates of the content.
 * That should help you to setup the mapping.
 * Writes a 'txt' file. 
 */
export class Xlsx_Anlayse_Task<T> extends Observable_Abstract_TaskBase<T> {

  props: Xlsx_Anlayse_Task_Props;

  constructor(props: Xlsx_Anlayse_Task_Props) {
    super();
    this.props = props;
  }

  perform(dao: Data_Interface<T>): Data_Interface<T> {
    let content: string = "";

    let key: keyof typeof dao.data;

    for (key in dao.data) {
      content = content.concat(
        "\n=====================================================\n"
      );
      content = content.concat("Mappe: ", key, "\n");
      content = content.concat(
        "=====================================================\n\n"
      );

      if (Array.isArray(dao.data[key])) {
        let xd = dao.data[key] as any[];

        for (let i = 0; i < xd.length; i++) {
          if (Array.isArray(xd[i])) {
            for (let j = 0; j < xd[i].length; j++) {
              if (xd[i][j] !== undefined) {
                content = content.concat(
                  "'" +
                    String(key) +
                    "' (x,y)=(" +
                    i +
                    "," +
                    j +
                    "):" +
                    xd[i][j],
                  "\n"
                );
              }
            }
          } else {
            // Dieser Fall ist bisher nicht aufgetreten
            content = content.concat(
              "'" + String(key) + "' (x,y)=(" + i + ",_):" + xd[i],
              "\n"
            );
          }
        }
      } else {
        // Dieser Fall ist bisher nicht aufgetreten
        content = content.concat(
          "'" + String(key) + "' (x,y)=(_,_):" + dao.data[key],
          "\n"
        );
      }
    }

    //TODO: build the filename
    this.props.write_path = this.props.write_path.trim();

    if(this.props.write_path===''){
      // dao.io_meta.file_name_reader

    }else if(Filesystem.isFolder(this.props.write_path)){
      Filesystem.get_filename_base_from(dao.io_meta.file_name_reader);
      // TODO: dao.io_meta.file_name_reader

    }

    Filesystem.write_file_txt(
      this.props.write_path,
      content
    );

    return dao;
  }
}
