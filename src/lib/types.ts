import { Observable, Observer_Interface, Observer_Props, Observer_Subject, Observer_Type } from "./observer";

/**
 * Alles ist ein Task: Transformer und Mapper.
 * Es gibt ein Data-Object (DAO) das durchgereicht wird.
 * Es gibt ein metadata objekt für File-Daten.
 * TODO und ein daten-objekt zum mappen ??
 */
export interface Task_Interface<D> extends Observable<D> {
  perform(dao: D, io_meta: IO_Meta_Interface): D;
    // TODO müssen die hier sein?
    add_observer(observer: Observer_Interface<D>, id:Observer_Type):void;
    notify_all(props:Observer_Props<D>): void;
    notify(props:Observer_Props<D>): void;
}

export interface MD_CopyTask_Type {
  source: string;
  target: string;
  simulate: boolean;
}

export interface MD_Task_Parameter_Type {
  tag_obsidian_prefix?: string;
  tag_obsidian_suffix?: string;
  find_rule?: string;
  replace_template: string;
  copy_task?: MD_CopyTask_Type;
}

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