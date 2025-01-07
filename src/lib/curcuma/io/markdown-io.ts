import { ObserverSubject } from "../observer";
import { DAO_META_Interface, IO_Interface, Observer_Props } from "../types";
import { Filesystem } from "../filesystem";

/**
 * Ein Markdown-File Reader und Writer.
 */
export interface md_reader_meta {
  file_list: string[];
  file_Name: string;
}

export interface md_writer_meta {
  file_list: string[];
  file_Name: string;
}

export class Markdown_DAO_META implements DAO_META_Interface {
  reader_meta: md_reader_meta = {
    file_list: [],
    file_Name: ""
  };
  writer_meta: md_writer_meta = {
    file_list: [],
    file_Name: ""
  } 
}

export class MY_Observer_Props<D> implements Observer_Props<D> {
  from: string;
  to: string;
  command: string;
  dao: D;
  dao_meta: DAO_META_Interface;
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

export class Markdown_IO<D, P> implements IO_Interface<D, P> {

  props: any = null;

  // Der reader löst ein Event aus, auf das der Runner hört.
  // Der reader schickt so die file-datensätze nacheinander zu weiteren Verarbeitung. 
  observer:ObserverSubject<D> = new ObserverSubject<D>();

  constructor(props: P){
    this.props = props;
  }

  setProps(props: P): void {
    this.props = props
  }

  /**
   * 
   * @param props 
   * @returns 
   */
  read(): void {

    var file_list: Array<string> = [];

    if (Filesystem.isFolder(this.props.readPath)) {
      file_list = Filesystem.get_files_list(
        this.props.readPath
      );

    } else if (Filesystem.isFile(this.props.readPath)) {
      file_list.push(this.props.readPath);
    } else {
      console.log(`not supported: '${this.props.readPath}'`);
    }

    console.log('Markdown_IO.read: ', file_list);

    file_list.forEach((file: string) => {

      //* 0. Observer Properties
      let o_props = new MY_Observer_Props<any>;
      o_props.from = "markdown-io";
      o_props.to = "runner";
      o_props.command = "perform-tasks";

      //* 1. DATEN LADEN
      let txt = Filesystem.read_file_txt(file);

      //* 2. DAO ERZEUGEN
      o_props.dao = txt;

      //* Metadaten zum DAO
      let dao_meta = new Markdown_DAO_META();
      dao_meta.reader_meta.file_list = file_list;
      dao_meta.reader_meta.file_Name = file;
      o_props.dao_meta = dao_meta;

      //* 3. fire event and inform listeners - which is only the runner at the moment.
      console.log("markdown-io.do_command: perform tasks for", file);
      this.observer.notify_all(o_props);
    });

    //* fire finished event to perform write!
    let m_props = new MY_Observer_Props<any>;
    m_props.from = "markdown-io";
    m_props.to = "runner";
    m_props.command = "tasks-finnished";
    
    this.observer.notify_all(m_props);

    return null; 
  }

  /**
   * 
   * @param dao 
   */
  write(dao: D): void {
    // TODO write markdown file, see md-transporter

    // Filesystem.write_my_file()

/*

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

*/
  }
}
