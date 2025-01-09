import {
  Observable,
  Observable_Type,
  Observer_Command_Type,
  Observer_Interface,
  Observer_Props,
  Observer_Subject,
  Observer_Type,
} from "../observer";
import { IO_Interface, IO_Meta_Interface } from "../types";
import { Filesystem } from "../filesystem";

/*

TODO TaskBase

*/

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
  dao: D;
  io_meta: IO_Meta_Interface;
}

// TODO Lese eine markdown Datei oder ein Verzeichnis von Markdown Dateien.

export interface Markdown_IO_Props_Interface {
  //! alt: MD_Transporter_Parameter_Type
  readPath: string; // Datei oder Verzeichnis
  writePath: string; // Verzeichnis
  simulate: boolean;
  doSubfolders: boolean;
  limit: number; // greift nur bei Verzeichnis
  useCounter: boolean;
}

export class Markdown_IO<D> implements IO_Interface<D>, Observable<D> {
  // Der reader löst ein Event aus, auf das der Runner hört.
  // Der reader schickt so die file-datensätze nacheinander zu weiteren Verarbeitung.
  private observer_subject: Observer_Subject<D> = new Observer_Subject<D>();

  private props: Markdown_IO_Props_Interface = null;

  constructor(props: Markdown_IO_Props_Interface) {
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

    if (Filesystem.isFolder(this.props.readPath)) {
      file_list = Filesystem.get_files_list(this.props.readPath);
    } else if (Filesystem.isFile(this.props.readPath)) {
      file_list.push(this.props.readPath);
    } else {
      console.log(`not supported: '${this.props.readPath}'`);
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
      o_props.dao = Filesystem.read_file_txt(file);

      //* 3. File-Metadaten
      let io_meta = new IO_Meta();
      io_meta.file_list_reader = file_list;
      io_meta.file_name_reader = file;
      
      // TODO: Unklar. Falls ein writer definiert ist darf es das überschreiben. 
      // TODO: Für den MD_Splitter_Task mach ich das erst mal so.
      io_meta.file_name_writer = this.props.writePath;


      o_props.io_meta = io_meta;

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

    // this.observer_subject.notify_all(m_props);
    this.notify_all(m_props);
  }

  /**
   *
   * @param dao
   */
  write(dao: D): void {
    // TODO write markdown file, see md-transporter
    // Filesystem.write_my_file()
    /*

    Filesystem.write_my_file<
      MD_FileContent_Interface,
      MD_Transporter_Parameter_Type
    >(
      source_file,
      job_parameter,
      mdfc,
      this.do_not_write_file,
      (filename: string, data: MD_FileContent_Interface) => {
        Filesystem.write_file_txt(
          filename,
          MD_FileContent.merge_frontmatter_body(data)
        );
      }
    );

*/
  }
}
