import { MD_CopyTask_Type } from "../md-transformer";
import { ObserverSubject } from "./observer";

export interface Observer_Props<D> {
  from: string
  to: string
  command: string
  dao: D
  dao_meta: DAO_META_Interface;
}

export interface Observer_Interface<D> {
  do_command(props: Observer_Props<D>): void;
}

/**
 * Alles ist ein Task: Transformer und Mapper.
 * Es gibt ein Data-Object  (DAO) das durchgereicht wird.
 * Es gibt ein Umgebungsvariablen-Objekt mit metadata - im DAO. 
 */
export interface Task_Interface<T> {
  perform(dao: T, dao_meta: DAO_META_Interface): T;
}

export interface Runner_Interface<D, P> extends Observer_Interface<D> {
  addTask(task: Task_Interface<D>): void;
  addReader(reader: IO_Interface<D, P>): void;
  addWriter(writer: IO_Interface<D, P>): void;

  run(): void;
  do_command(props: Observer_Props<D>): void; // eigentlich do_reader_command
}

export interface IO_Interface<D, P> {
  setProps(props: P): void;
  read(): void;
  write(dao: D): void;
  observer: ObserverSubject<D>;
}

export interface DAO_META_Interface{
  reader_meta: any;
  writer_meta: any;
}


/**
 * Frontmatter is separated from the rest of the text for easier processing.
 *
 * content.attributes - contains the extracted yaml attributes in json form
 * content.body - contains the string contents below the yaml separators
 * content.bodyBegin - contains the line number the body contents begins at
 * content.frontmatter - contains the original yaml string contents
 * @export
 * @interface MD_FileContent_Interface
 */
export interface MD_FileContent_Interface {
  frontmatter: string;
  frontmatter_attributes: any;
  body_array: string[];
  index: number;
}


export interface MD_Task_Parameter_Type {
  tag_obsidian_prefix: string;
  tag_obsidian_suffix: string;
  find_rule?: string;
  replace_template: string;
  copy_task?: MD_CopyTask_Type;
}

export interface IOable {
  readPath: string; // Datei oder Verzeichnis
  writePath: string; // Verzeichnis
  simulate: boolean;
}