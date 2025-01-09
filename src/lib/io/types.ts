import { Observable, Observer_Interface, Observer_Props, Observer_Type } from "../core";

export interface IO_Interface<D> extends Observable<D> {
    read(): void;
    write(dao: D): void;
    // TODO müssen die hier sein?
    add_observer(observer: Observer_Interface<D>, id:Observer_Type):void;
    notify_all(props:Observer_Props<D>): void;
    notify(props:Observer_Props<D>): void;
  }
  
  export interface IOable {
    readPath: string; // Datei oder Verzeichnis
    writePath: string; // Verzeichnis
    simulate: boolean;
  }
  
  export interface IO_Meta_Interface {
    file_list_reader: string[];
    file_name_reader: string;
    file_list_writer: string[];
    file_name_writer: string;
  }