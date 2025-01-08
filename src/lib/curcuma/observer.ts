import { IO_Meta_Interface } from "./types";

export type Observer_Command_Type = 'perform-tasks' | 'tasks-finnished' | 'do-io-write' | 'do-not-io-write';

export interface Observer_Props<D> {
  from: string
  to: string
  command: Observer_Command_Type // TODO Ein Array of Observer_Commands
  dao?: D
  io_meta?: IO_Meta_Interface;
}

export class Observer_Item<D> {
  observer_id: string = '';
  observer_obj: Observer_Interface<D>;
}

export interface Observer_Interface<D> {
  do_command(props: Observer_Props<D>): void;
  //? id:string;
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
  add_observer(observer: Observer_Interface<D>, id:string) {

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
  notify_all(props:Observer_Props<D>): void {
    if (this.observers.length > 0) {
      this.observers.forEach((observer) =>
        observer.observer_obj.do_command(props)
      );
    }
  }

  /**
   * Notify a Observer, that the subject has changed.
   * 
   * @param props 
   */
  notify(props:Observer_Props<D>): void {
    if (this.observers.length > 0) {
      // TODO Der Observer könnte noch sagen wer er ist, 
      // TODO dann könnte ich ihn in notify exakt ansteuern.
      // TODO filter nach ID
      this.observers.forEach((observer) =>
        observer.observer_obj.do_command(props)
      );
    }
  }
}
