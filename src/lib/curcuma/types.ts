import { MD_CopyTask_Type } from "../md-transformer";
import { ObserverSubject } from "./observer";

/**
 * Alles ist ein Task: Transformer und Mapper.
 * Es gibt ein Data-Object  (DAO) das durchgereicht wird.
 * Es gibt ein metadata objekt für File-Daten.
 * TODO und ein daten-objekt zum mappen ??
 */
export interface Task_Interface<D> {
  perform(dao: D, io_meta: IO_Meta_Interface): D;
}

export interface MD_Task_Parameter_Type {
  tag_obsidian_prefix?: string;
  tag_obsidian_suffix?: string;
  find_rule?: string;
  replace_template: string;
  copy_task?: MD_CopyTask_Type;
}

export interface IO_Interface<D> {
  read(): void;
  write(dao: D): void;
  observer: ObserverSubject<D>;
}

export interface IOable {
  readPath: string; // Datei oder Verzeichnis
  writePath: string; // Verzeichnis
  simulate: boolean;
}

export interface IO_Meta_Interface {
  reader_meta: any;
  writer_meta: any;
}