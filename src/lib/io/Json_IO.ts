import { Filesystem } from "../core/filesystem";
import {
  Observable,
  Observer_Interface,
  Observer_Props,
  Observer_Subject,
  Observer_Type,
} from "../core/observer";
import { IO_Observer_Props } from "./types";
import { IO_Meta } from "./types";
import {
  Data_Interface,
  IO_Observable_Reader_Interface,
  IO_Observable_Writer_Interface,
} from "./types";

// TODO Lese eine JSON Datei oder ein Verzeichnis von JSON Dateien.

export interface Json_IO_ReadProps_Interface {
  //! alt: MD_Transporter_Parameter_Type
  path: string; // File or Folder
  simulate: boolean;

  doSubfolders: boolean;
  limit: number; // greift nur bei Verzeichnis
  useCounter: boolean;
}

export interface Json_IO_WriteProps_Interface {
  //! alt: MD_Transporter_Parameter_Type
  path: string; // Folder
  simulate: boolean;

  doSubfolders: boolean;
  limit: number; // greift nur bei Verzeichnis
  useCounter: boolean;
}

export class Json_IO_Reader<D>
  implements IO_Observable_Reader_Interface<D>, Observable<D>
{
  // Der reader löst ein Event aus, auf das der Runner hört.
  // Der reader schickt so die file-datensätze nacheinander zu weiteren Verarbeitung.
  private observer_subject: Observer_Subject<D> = new Observer_Subject<D>();

  private props: Json_IO_ReadProps_Interface = null;

  constructor(props: Json_IO_ReadProps_Interface) {
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

    // console.log("Json_IO.read: ", file_list);

    file_list.forEach((file: string) => {
      //* 1. Observer Properties
      // Die Nachricht die an alle Listener gesendet wird.

      let o_props = new IO_Observer_Props<D>();
      o_props.from = "json-io";
      o_props.to = "runner";
      o_props.command = "perform-tasks";

      //* 2. DATEN LADEN und DAO ERZEUGEN (in dem Fall ein Markdown String)
      let dao_string: any = Filesystem.read_file_json(file);

      // TODO REFACTOR: MD_Observable_Abstract_TaskBase code nach hier umziehen
      // TODO REFACTOR: Das DAO sollte komplett mdfc bzw. ein Objekt: mdfc + i

      //* 3. File-Metadaten
      let io_meta = new IO_Meta();
      io_meta.file_list_reader = file_list;
      io_meta.file_name_reader = file;

      let the_dao: Data_Interface<D> = {
        data: dao_string,
        io_meta: io_meta,
      };

      o_props.dao = the_dao;

      //* 4. fire event and inform listeners - which is only the runner at the moment.
      console.log("markdown-io.do_command: perform tasks for", file);
      this.notify_all(o_props); // this.observer_subject.notify_all(o_props);
    });

    //* fire finished event to perform write!
    let m_props = new IO_Observer_Props<any>();
    m_props.from = "markdown-io";
    m_props.to = "runner";
    m_props.command = "tasks-finnished";

    this.notify_all(m_props);
  }
}

export class Json_IO_Writer<D>
  implements IO_Observable_Writer_Interface<D>, Observable<D>
{
  // Der reader löst ein Event aus, auf das der Runner hört.
  // Der reader schickt so die file-datensätze nacheinander zu weiteren Verarbeitung.
  private observer_subject: Observer_Subject<D> = new Observer_Subject<D>();

  private props: Json_IO_ReadProps_Interface = null;

  constructor(props: Json_IO_ReadProps_Interface) {
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
   * TODO: Fürs sammeln von Datensätzen bräuchte ich einen Collector-Task.
   * TODO: Unterscheidung: writePath == File | writePath == Folder
   * Fall 2: Mehrere Dateien schreiben.
   * Als Dateiname wird der Name der Quelldatei genommen.
   * dao.io_meta.filename_reader
   */
  write(dao: Data_Interface<D>): void {
    console.log("### XLSX_IO.write: ", dao);
    Filesystem.write_file_json(this.props.path, dao.data);
  }
}
