// Alte Observer-Logik

import { Data_Interface } from "../io/types";

export type Observer_Command_Type =
  | "perform-tasks"
  | "tasks-finished"
  | "do-io-write"
  | "do-not-io-write";

export type Observer_Type = "runner";
export type Observable_Type = "markdown-io" | "md-splitter-task" | "json-io" | "xlsx-io" | "csv-io";

export interface Observer_Props<D> {
  from: Observable_Type;
  to: Observer_Type;
  command: Observer_Command_Type; // TODO Ein Array of Observer_Commands
  dao: Data_Interface<D>;
}

export interface Observable<D> {
  add_observer(observer: Observer_Interface<D>, id: Observer_Type): void;
  notify_all(props: Observer_Props<D>): void;
  notify(props: Observer_Props<D>): void;
}

export class Observer_Item<D> {
  observer_id: Observer_Type;
  observer_obj: Observer_Interface<D>;
}

export interface Observer_Interface<D> {
  do_command(props: Observer_Props<D>): void;
  get_observer_id(): Observer_Type;
}

export class Observer_Subject<D> {
  protected observers: Array<Observer_Item<D>>;

  /**
   * Construct me!
   */
  constructor() {
    this.observers = [];
  }

  /**
   * Add an Observer to the Observer_Subject.
   *
   * @param observer the Observer object
   * @param id - unique identifier (could be the Class-Name)
   */
  add_observer(observer: Observer_Interface<D>, id: Observer_Type) {
    let oi = new Observer_Item<D>();
    oi.observer_id = id;
    oi.observer_obj = observer;
    this.observers.push(oi);
  }

  /**
   * Notify all Observers, that the subject has changed.
   *
   * @param props
   */
  notify_all(props: Observer_Props<D>): void {
    if (this.observers.length > 0) {
      this.observers.forEach((observer) =>
        observer.observer_obj.do_command(props)
      );
    }
  }

  /**
   * Notify a Observer, that the subject has changed.
   * Get the id from props.to
   *
   * @param props
   */
  notify(props: Observer_Props<D>): void {
    if (this.observers.length > 0) {
      // Select individual observers via the ID.
      const result = this.observers.filter(
        (observer) => observer.observer_id === props.to
      );

      result.forEach((observer) => observer.observer_obj.do_command(props));
    }
  }
}
