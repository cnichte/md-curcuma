export interface MD_Observer_Interface {
  do_command(from: string, to: string, command: string): void;
}

export interface MD_Observer_Subject_Interface {
  add_observer(observer: MD_Observer_Interface): void;
  notify_all(observer_subject: string, observer_subject_message: string): void;
}

export class MD_ObserverSubject {
  protected observers: Array<MD_Observer_Interface>;

  constructor() {
    this.observers = [];
  }

  add_observer(observer: MD_Observer_Interface) {
    this.observers.push(observer);
  }

  notify_all(from: string, to: string, command: string): void {
    if (this.observers.length > 0) {
      this.observers.forEach((observer) =>
        observer.do_command(from, to, command)
      );
    }
  }
}