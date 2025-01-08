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


// TODO Lese eine JSON Datei oder ein Verzeichnis von JSON Dateien.

export interface Html_IO_Props_Interface {
  //! alt: MD_Transporter_Parameter_Type
  readPath: string; // Datei oder Verzeichnis
  writePath: string; // Verzeichnis
  simulate: boolean;
  doSubfolders: boolean;
  limit: number; // greift nur bei Verzeichnis
  useCounter: boolean;
}

export class Html_IO<D> implements IO_Interface<D>, Observable<D> {
  // Der reader löst ein Event aus, auf das der Runner hört.
  // Der reader schickt so die file-datensätze nacheinander zu weiteren Verarbeitung.
  private observer_subject: Observer_Subject<D> = new Observer_Subject<D>();

  private props: Html_IO_Props_Interface = null;

  constructor(props: Html_IO_Props_Interface) {
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

  }

  /**
   *
   * @param dao
   */
  write(dao: D): void {

  }
}
