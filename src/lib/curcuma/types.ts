import { MD_CopyTask_Type } from "../md-transformer";
import { Observer_Subject } from "./observer";

/**
 * Alles ist ein Task: Transformer und Mapper.
 * Es gibt ein Data-Object (DAO) das durchgereicht wird.
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
  observer_subject: Observer_Subject<D>;
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