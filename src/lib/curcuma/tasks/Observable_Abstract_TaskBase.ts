import {
  Observable,
  Observer_Interface,
  Observer_Props,
  Observer_Subject,
  Observer_Type,
} from "../observer";
import { IO_Meta_Interface, Task_Interface } from "../types";

/**
 * Makes a Task Observable.
 */
export abstract class Observable_Abstract_TaskBase<T>
  implements Task_Interface<T>, Observable<T>
{
  private observer_subject: Observer_Subject<T> = new Observer_Subject<T>();

  constructor() {}

  notify_all(props: Observer_Props<T>): void {
    this.observer_subject.notify_all(props);
  }
  notify(props: Observer_Props<T>): void {
    this.observer_subject.notify(props);
  }

  add_observer(observer: Observer_Interface<T>, id: Observer_Type): void {
    this.observer_subject.add_observer(observer, id);
  }

  abstract perform(dao: T, io_meta: IO_Meta_Interface): T;
}
