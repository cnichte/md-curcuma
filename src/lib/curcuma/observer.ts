import { IO_Meta_Interface } from "./types";

export type Observer_Command_Type = 'perform-tasks' | 'tasks-finnished' | 'do-io-write' | 'do-not-io-write';

export interface Observer_Props<D> {
  from: string
  to: string
  command: Observer_Command_Type // TODO Ein Array of Observer_Commands
  dao?: D
  io_meta?: IO_Meta_Interface;
}

export interface Observer_Interface<D> {
  do_command(props: Observer_Props<D>): void;
  //? id():string;
}

export class ObserverSubject<D> {
  protected observers: Array<Observer_Interface<D>>;

  constructor() {
    this.observers = [];
  }

  add_observer(observer: Observer_Interface<D>) {
    this.observers.push(observer);
  }

  notify_all(props:Observer_Props<D>): void {
    if (this.observers.length > 0) {
      this.observers.forEach((observer) =>
        observer.do_command(props)
      );
    }
  }


  notify(props:Observer_Props<D>): void {
    // TODO Der Observer könnte noch sagen wer er ist, dann könnte ich ihn in notify exakt ansteuern.
  }
}
