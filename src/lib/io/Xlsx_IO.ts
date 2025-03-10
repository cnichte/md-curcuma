//! ehemals xlsx-transporter
import { omit } from "lodash";
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
  IO_Observable_Reader_Interface,
  IO_Observable_Writer_Interface,
  IOable,
} from "./types";

import * as XLSX from "xlsx";

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
    // https://docs.sheetjs.com/docs/getting-started/examples/import#extract-raw-data
    // TODO Datensätze häppchenweise an die Tasks verfüttern. Siehe zB. Markdown_IO oder Json_IO
    XLSX.utils.sheet_to_json(Filesystem.read_file_xlsx(this.props.path), {
      header: 1,
    });
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

    let filtered_data: any = dao.data;

    for (const exclude_column of this.props.exclude_columns) {
      if (dao.data.hasOwnProperty(exclude_column)){
      // GUIDE https://stackabuse.com/bytes/typescript-remove-a-property-from-an-object/
      filtered_data = omit(dao.data as Object, exclude_column);
      }
    }

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
