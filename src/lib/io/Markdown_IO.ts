import {
  Observable,
  Observable_Type,
  Observer_Command_Type,
  Observer_Interface,
  Observer_Props,
  Observer_Subject,
  Observer_Type,
} from "../core/observer";

import {
  DAO_Interface,
  IO_Observable_Interface,
  IO_Meta_Interface,
  IOable,
} from "./types";
import { Filesystem } from "../core/filesystem";

/**
 ** Lese und schreibe Markdown-Dateien.
 */
export class IO_Meta implements IO_Meta_Interface {
  file_list_reader: string[];
  file_name_reader: string;
  file_list_writer: string[];
  file_name_writer: string;
}

export class IO_Observer_Props<D> implements Observer_Props<D> {
  from: Observable_Type;
  to: Observer_Type;
  command: Observer_Command_Type;
  dao: DAO_Interface<D>;
}

// TODO Lese eine markdown Datei oder ein Verzeichnis von Markdown Dateien.

export interface Markdown_IO_ReadProps_Interface extends IOable {
  path: string; // Datei oder Verzeichnis
  simulate: boolean;
  doSubfolders: boolean;
  limit: number; // greift nur bei Verzeichnis
  useCounter: boolean;
}

export interface Markdown_IO_WriteProps_Interface extends IOable {
  path: string; // Verzeichnis
  simulate: boolean;
}

export class Markdown_IO<D> implements IO_Observable_Interface<D>, Observable<D> {
  // Der reader löst ein Event aus, auf das der Runner hört.
  // Der reader schickt so die file-datensätze nacheinander zu weiteren Verarbeitung.
  private observer_subject: Observer_Subject<D> = new Observer_Subject<D>();

  private read_props: Markdown_IO_ReadProps_Interface = null;
  private write_props: Markdown_IO_WriteProps_Interface = null;

  constructor(
    read_props: Markdown_IO_ReadProps_Interface,
    write_props: Markdown_IO_WriteProps_Interface | null
  ) {
    this.read_props = read_props;
    this.write_props = write_props;
    if (write_props == null) {
      this.write_props = {
        path: read_props.path,
        simulate: false,
      };
    }
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

    if (Filesystem.isFolder(this.read_props.path)) {
      file_list = Filesystem.get_files_list(this.read_props.path);
    } else if (Filesystem.isFile(this.read_props.path)) {
      file_list.push(this.read_props.path);
    } else {
      console.log(`not supported: '${this.read_props.path}'`);
    }

    console.log("Markdown_IO.read: ", file_list);

    file_list.forEach((file: string) => {
      //* 1. Observer Properties
      // Die Nachricht die an alle Listener gesendet wird.
      let o_props = new IO_Observer_Props<any>();
      o_props.from = "markdown-io";
      o_props.to = "runner";
      o_props.command = "perform-tasks";

      //* 2. DATEN LADEN und DAO ERZEUGEN (in dem Fall ein Markdown String)
      let dao_string: string = Filesystem.read_file_txt(file);

      // TODO REFACTOR: MD_Observable_Abstract_TaskBase code nach hier umziehen
      // TODO REFACTOR: Das DAO sollte komplett mdfc bzw. ein Objekt: mdfc + i

      //* 3. File-Metadaten
      let io_meta = new IO_Meta();
      io_meta.file_list_reader = file_list;
      io_meta.file_name_reader = file;

      // TODO: Unklar. Falls ein writer definiert ist darf es das überschreiben.
      // TODO: Für den MD_Splitter_Task mach ich das erst mal so.
      io_meta.file_name_writer = this.write_props.path;

      let the_dao: DAO_Interface<string> = {
        dao: dao_string,
        io_meta: io_meta,
      };

      o_props.dao = the_dao;

      //* 4. fire event and inform listeners - which is only the runner at the moment.
      console.log("markdown-io.do_command: perform tasks for", file);

      this.notify_all(o_props);
      // this.observer_subject.notify_all(o_props);
    });

    //* fire finished event to perform write!
    let m_props = new IO_Observer_Props<any>();
    m_props.from = "markdown-io";
    m_props.to = "runner";
    m_props.command = "tasks-finnished";

    this.notify_all(m_props);
  }

  /**
   *
   * @param dao
   */
  write(dao: DAO_Interface<D>): void {
    let source_file = this.read_props.path;
    // TODO I don't actually want to write the entire file when splitting.
    // TODO perhaps i want to transform also the filename.

    Filesystem.write_my_file<any, Markdown_IO_WriteProps_Interface>(
      source_file,
      this.write_props,
      dao.dao,
      false, // do_not_write_file
      (filename: string, data: string) => {
        Filesystem.write_file_txt(filename, data);
      }
    );
  }
}
