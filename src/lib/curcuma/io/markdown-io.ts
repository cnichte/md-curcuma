import { Observer_Props, ObserverSubject } from "../observer";
import { DAO_Interface, IO_Interface } from "../types";

import { MD_Filesystem } from "../../md-filesystem";

/**
 * Ein Markdown-File Reader und Writer.
 */
export interface Markdown_IO_Props_Interface {
  //! alt: MD_Transporter_Parameter_Type
  readPath: string; // Datei oder Verzeichnis
  writePath: string; // Verzeichnis
  simulate: boolean;
  doSubfolders: boolean;
  limit: number; // greift nur bei Verzeichnis
  useCounter: boolean;
}

export interface md_reader_meta {
  file_list: string[];
  file_Name: string;
}

export interface md_writer_meta {
  file_list: string[];
  file_Name: string;
}

export class Markdown_DAO<R> implements DAO_Interface<R> {
  reader_meta: md_reader_meta = {
    file_list: [],
    file_Name: ""
  };
  writer_meta: md_writer_meta = {
    file_list: [],
    file_Name: ""
  } 
  data: R;
}

export class MY_Observer_Props<D> implements Observer_Props<D> {
  from: string;
  to: string;
  command: string;
  dao: D;

}

// TODO Lese eine markdown Datei oder ein Verzeichnis von Markdown Dateien.


export class Markdown_IO<Markdown_DAO, Markdown_IO_Props_Interface > implements IO_Interface<Markdown_DAO, Markdown_IO_Props_Interface> {

  props: any = null;

  // Der reader löst ein Event aus, auf das der Runner hört.
  // Der reader schickt so die file-datensätze nacheinander zu weiteren Verarbeitung. 
  observer:ObserverSubject<Markdown_DAO> = new ObserverSubject<Markdown_DAO>();

  constructor(props: Markdown_IO_Props_Interface){
    this.props = props;
  }

  setProps(props: Markdown_IO_Props_Interface): void {
    this.props = props
  }

  /**
   * 
   * @param props 
   * @returns 
   */
  read(): Markdown_DAO {

    var file_list: Array<string> = [];

    if (MD_Filesystem.isFolder(this.props.readPath)) {
      file_list = MD_Filesystem.get_files_list(
        this.props.readPath
      );

    } else if (MD_Filesystem.isFile(this.props.readPath)) {
      file_list.push(this.props.readPath);
    } else {
      console.log(`not supported: '${this.props.readPath}'`);
    }

    console.log(file_list);

    file_list.forEach((file: string) => {

      //* 1. DATEN LADEN
      let txt = MD_Filesystem.read_file_txt(file);

      //* 2. DAO ERZEUGEN
      let m_props = new MY_Observer_Props<any>; // TODO <Markdown_DAO>
      m_props.from = "markdown-io";
      m_props.to = "runner";
      m_props.command = "perform-tasks";
      
      let dao = new Markdown_DAO();
      dao.reader_meta.file_list = file_list;
      dao.reader_meta.file_Name = file;
      dao.data = "DA IST DER TEXT" // TODO txt;

      m_props.dao = dao;

      //* 3. fire event and inform listeners
      this.observer.notify_all(m_props);
    });

    // fire finished event to perform write!
    let m_props = new MY_Observer_Props<any>;
    m_props.from = "markdown-io";
    m_props.to = "runner";
    m_props.command = "tasks-finnished";
    
    let dao = new Markdown_DAO();
    dao.reader_meta.file_list = file_list;
    // dao.data = txt;

    m_props.dao = dao;
    
    this.observer.notify_all(m_props);


    return null; 
  }

  /**
   * 
   * @param dao 
   */
  write(dao: Markdown_DAO): Markdown_DAO {
    throw new Error("Method not implemented.");
  }
}
