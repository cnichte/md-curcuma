//! ehemals xlsx-transporter
import { Filesystem } from "../core/filesystem";
import {
  Observable,
  Observer_Command_Type,
  Observer_Interface,
  Observer_Props,
  Observer_Subject,
  Observer_Type,
} from "../core/observer";
import {
  Data_Interface,
  IO_Meta,
  IO_Observable_Reader_Interface,
  IO_Observable_Writer_Interface,
  IO_Observer_Props,
  IOable,
} from "./types";

import * as XLSX from "xlsx";
import { Utils } from "../core/utils";

//! import { Mapping_XXX_Interface, Mapping_Item  } from "../tasks/Mapping_Task";

export interface XLSX_Mapping_Item {
  //! extends Mapping_Item {
  sheet_name: string;
  source_property_name: string;
  target_poperty_name: string;
}

export interface XLSX_IO_ReadProps_Interface<T> extends IOable {
  // IOable
  path: string; // Datei oder Verzeichnis
  simulate: boolean;
  // the rest
  worksheet: string;

  doSubfolders: boolean;
  limit: number;
  useCounter: boolean;
  json_template: T;
  //! mappings?: Mapper_Interface<XLSX_Mapping_Item | Mapping_Item>[];
  commands?: Observer_Command_Type[];
  onPartialResult?: (value: T) => void;
}

export interface XLSX_IO_WriteProps_Interface<T> extends IOable {
  // IOable
  path: string; // Datei oder Verzeichnis
  simulate: boolean;
  // the rest
  worksheet: string;
  exclude_columns: Array<string>;

  doSubfolders: boolean;
  limit: number;
  useCounter: boolean;
  json_template: T;
  //! mappings?: Mapper_Interface<XLSX_Mapping_Item | Mapping_Item>[];
  commands?: Observer_Command_Type[];
  onPartialResult?: (value: T) => void;
}

//! XLSX.WorkBook
export class XLSX_IO_Reader<D>
  implements IO_Observable_Reader_Interface<D>, Observable<D>
{
  // Der reader löst ein Event aus, auf das der Runner hört.
  // Der reader schickt so die file-datensätze nacheinander zu weiteren Verarbeitung.
  private observer_subject: Observer_Subject<D> = new Observer_Subject<D>();

  private props: XLSX_IO_ReadProps_Interface<D> = null;

  constructor(props: XLSX_IO_ReadProps_Interface<D>) {
    this.props = props;
  }

  add_observer(observer: Observer_Interface<D>, id: Observer_Type): void {
    this.observer_subject.add_observer(observer, id);
  }
  notify_all(props: Observer_Props<D>): void {
    this.observer_subject.notify_all(props);
  }
  notify(props: Observer_Props<D>): void {
    this.observer_subject.notify(props);
  }

  /**
   *
   * @param props
   * @returns
   */
  read(): void {
    var file_list: Array<string> = [];

    if (Filesystem.isFolder(this.props.path)) {
      file_list = Filesystem.get_files_list(this.props.path);
    } else if (Filesystem.isFile(this.props.path)) {
      file_list.push(this.props.path);
    } else {
      console.log(`not supported: '${this.props.path}'`);
    }

    console.log("Xlsx_IO.read: ", file_list);

    file_list.forEach((file: string) => {
      //* 1. Observer Properties
      // Die Nachricht die an alle Listener gesendet wird.
      let o_props = new IO_Observer_Props<any>();
      o_props.from = "xlsx-io";
      o_props.to = "runner";
      o_props.command = "perform-tasks";

      //* 2. DATEN LADEN und DAO ERZEUGEN

      // https://docs.sheetjs.com/docs/getting-started/examples/import#extract-raw-data
      let wb: XLSX.WorkBook = Filesystem.read_file_xlsx(this.props.path);

      let wb_json = new Map<string, any>();

      wb.SheetNames.forEach((sn) => {
        let d: any = XLSX.utils.sheet_to_json(wb.Sheets[sn], {
          header: 1,
        });
        wb_json.set(sn, d);
      });

      //* 3. File-Metadaten
      let io_meta = new IO_Meta();
      io_meta.file_list_reader = file_list;
      io_meta.file_name_reader = file;

      let the_dao: Data_Interface<any> = {
        data: Object.fromEntries(wb_json), // Make (Json)-Object from Map
        io_meta: io_meta,
      };

      o_props.dao = the_dao;

      //* 4. fire event and inform listeners - which is only the runner at the moment.
      console.log("xlsx-io.do_command: perform tasks for", file);

      this.notify_all(o_props); // this.observer_subject.notify_all(o_props);
    });

    //* 5. fire finished event to perform final write!
    let m_props = new IO_Observer_Props<any>();
    m_props.from = "markdown-io";
    m_props.to = "runner";
    m_props.command = "tasks-finished";

    this.notify_all(m_props);
  }
}

export class XLSX_IO_Writer<D>
  implements IO_Observable_Writer_Interface<D>, Observable<D>
{
  // Der reader löst ein Event aus, auf das der Runner hört.
  // Der reader schickt so die file-datensätze nacheinander zu weiteren Verarbeitung.
  private observer_subject: Observer_Subject<D> = new Observer_Subject<D>();

  private props: XLSX_IO_WriteProps_Interface<D> = null;

  constructor(props: XLSX_IO_WriteProps_Interface<D>) {
    this.props = props;
  }

  add_observer(observer: Observer_Interface<D>, id: Observer_Type): void {
    this.observer_subject.add_observer(observer, id);
  }
  notify_all(props: Observer_Props<D>): void {
    this.observer_subject.notify_all(props);
  }
  notify(props: Observer_Props<D>): void {
    this.observer_subject.notify(props);
  }

  /**
   * Entweder an bestehende Datei anhängen oder einmalig eine neue Datei schreiben.
   * TODO: Fürs sammeln von Datensätzen bräuchte ich einen Collector-Task.
   * TODO: Unterscheidung: writePath == File | writePath == Folder
   * Fall 2: Mehrere Dateien schreiben.
   * Als Dateiname wird der Name der Quelldatei genommen.
   * dao.io_meta.filename_reader
   *
   * @param dao
   */
  write(dao: Data_Interface<D>): void {
    console.log("### XLSX_IO.write: ", dao);

    let filtered_data = Utils.remove_property_from_object(
      dao.data,
      this.props.exclude_columns
    );

    // Datensatz ggfs. in ein Array wrappen...
    // array_of_objects
    let aoo = Array.isArray(filtered_data) ? filtered_data : [filtered_data];

    // https://docs.sheetjs.com/docs/getting-started/examples/export

    if (Filesystem.is_file_exist(this.props.path)) {
      // An bestehende Datei / Worksheet anhängen
      let workbook: XLSX.WorkBook = Filesystem.read_file_xlsx(this.props.path);
      var worksheet = workbook.Sheets[this.props.worksheet];

      XLSX.utils.sheet_add_json(worksheet, aoo, {
        skipHeader: true,
        origin: -1,
      });

      Filesystem.write_file_xlsx(this.props.path, workbook);
    } else {
      // Neue Datei / Worksheet erzeugen, wenn nicht vorhanden.
      const worksheet = XLSX.utils.json_to_sheet(aoo);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, this.props.worksheet);

      Filesystem.write_file_xlsx(this.props.path, workbook);
    }
  }
}
