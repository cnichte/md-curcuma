export interface Observer_Props<D> {
  from: string
  to: string
  command: string
  dao: D
}

export interface Observer_Interface<D> {
  do_command(props: Observer_Props<D>): void;
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
}
