import { Observable, Observable_Type, Observer_Command_Type, Observer_Interface, Observer_Props, Observer_Type } from "../core";

/**
 * This is a wrapper for the Data-Object DAO, so that it can be enriched with metadata.
 */
export interface Data_Interface<D> {
  data: D
  io_meta: IO_Meta_Interface;
}

export interface IO_Observable_Reader_Interface<D> extends Observable<D> {
    read(): void;
    // TODO müssen die hier sein?
    add_observer(observer: Observer_Interface<D>, id:Observer_Type):void;
    notify_all(props:Observer_Props<D>): void;
    notify(props:Observer_Props<D>): void;
  }
  
  export interface IO_Observable_Writer_Interface<D> extends Observable<D> {
    write(data: Data_Interface<D>): void;
    // TODO müssen die hier sein?
    add_observer(observer: Observer_Interface<D>, id:Observer_Type):void;
    notify_all(props:Observer_Props<D>): void;
    notify(props:Observer_Props<D>): void;
  }

  export interface IOable {
    path: string; // Datei oder Verzeichnis
    simulate: boolean;
  }
  
  export interface IO_Meta_Interface {
    file_list_reader: string[];
    file_name_reader: string;
    file_list_writer: string[];
    file_name_writer: string;
  }
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
  dao: Data_Interface<D>;
}

