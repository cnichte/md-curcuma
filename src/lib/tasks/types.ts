import {
  Observable,
  Observer_Interface,
  Observer_Props,
  Observer_Type,
} from "../core";
import { CopyTask_Type } from "../core/copy-job";
import { Data_Interface, IO_Meta_Interface } from "../io/types";

export interface MD_Task_Parameter_Type {
  tag_obsidian_prefix?: string;
  tag_obsidian_suffix?: string;
  find_rule?: string;
  replace_template: string;
  copy_task?: CopyTask_Type;
}

/**
 * Alles ist ein Task: Transformer und Mapper.
 * Es gibt ein Data-Object (DAO) das durchgereicht wird.
 * Es gibt ein metadata objekt für File-Daten.
 * TODO und ein daten-objekt zum mappen ??
 */
export interface Task_Interface<D> extends Observable<D> {
  perform(dao:Data_Interface<D>): Data_Interface<D>; //! dao: D, io_meta: IO_Meta_Interface
  // TODO müssen die hier sein?
  add_observer(observer: Observer_Interface<D>, id: Observer_Type): void;
  notify_all(props: Observer_Props<D>): void;
  notify(props: Observer_Props<D>): void;
}
