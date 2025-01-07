import { ObserverSubject, Observer_Interface, Observer_Props } from "./observer";

/**
 * Alles ist ein Task: Transformer und Mapper.
 * Es gibt ein Data-Object  (DAO) das durchgereicht wird.
 * Es gibt ein Umgebungsvariablen-Objekt mit metadata - im DAO. 
 */
export interface Task_Interface<T> {
  perform(dao: T): T;
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
  read(): D;
  write(dao: D): D;
  observer: ObserverSubject<D>;
}

export interface DAO_Interface<R> {
  data: R;
}

export interface DAO_META_Interface<R> extends DAO_Interface<R> {
  reader_meta: any;
  writer_meta: any;
  data: R;
}
