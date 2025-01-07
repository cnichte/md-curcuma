import { Observer_Interface, Observer_Props } from "./types";

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
}
