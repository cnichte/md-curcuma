//! ehemals xlsx-transporter 
import {
  Observable,
  Observer_Command_Type,
  Observer_Interface,
  Observer_Props,
  Observer_Subject,
  Observer_Type,
} from "../observer";
import { IO_Interface, IOable } from "../types";

//! import { Mapping_XXX_Interface, Mapping_Item  } from "../tasks/Mapping_Task";

export interface XLSX_Mapping_Item { //! extends Mapping_Item {
  sheet_name: string;
  source_property_name: string;
  target_poperty_name: string;
}

export interface XLSX_Transporter_Parameter_Type<T> extends IOable {
  // IOable
  readPath: string; // Datei oder Verzeichnis
  writePath: string; // Verzeichnis
  simulate: boolean;
  // the rest
  doSubfolders: boolean;
  limit: number;
  useCounter: boolean;
  json_template: T;
  //! mappings?: Mapper_Interface<XLSX_Mapping_Item | Mapping_Item>[];
  commands?: Observer_Command_Type[];
  onPartialResult?: (value: T) => void;
}

//! XLSX.WorkBook
export class XLSX_IO<D> implements IO_Interface<D>, Observable<D>
{
  // Der reader löst ein Event aus, auf das der Runner hört.
  // Der reader schickt so die file-datensätze nacheinander zu weiteren Verarbeitung.
  private observer_subject: Observer_Subject<D> = new Observer_Subject<D>();

  private props: XLSX_Transporter_Parameter_Type<D> = null;

  constructor(props: XLSX_Transporter_Parameter_Type<D>) {
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
