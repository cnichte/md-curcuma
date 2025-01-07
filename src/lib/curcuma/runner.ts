import { Observer_Props } from "./observer";
import { IO_Interface, Runner_Interface, Task_Interface } from "./types";

export class Runner<D, P> implements Runner_Interface<D, P> {

  private tasks: Task_Interface<D>[] = [];
  private reader: IO_Interface<D, P> = null;
  private writer: IO_Interface<D, P> = null;

  addTask(task: Task_Interface<D>): void {
    this.tasks.push(task);
  }

  addReader(reader: IO_Interface<D, P>): void {
    this.reader = reader;
  }
  addWriter(writer: IO_Interface<D, P>): void {
    this.writer = writer;
  }

  do_command(props: Observer_Props<D>): void {
    console.log("runner received props!", props);

    if (
      props.from === "markdown-io" &&
      props.to === "runner" &&
      props.command === "perform-tasks"
    ) {
      // TODO tasks anwenden
      for (let task of this.tasks) {
        task.perform(props.dao);
      }
    } else if (
      props.from === "markdown-io" &&
      props.to === "runner" &&
      props.command === "tasks-finnished"
    ) {
      // TODO nach dem letzten dao schreiben

      console.log("FERTIG, FÜHRE WRITE AUS!!!");
      if (this.writer != null) {
        // TODO: Was schreiben? da müsste was übergeben werden...
        // normalerweise sammelt man vielleicht, und akkumliert daten auf
        // die am Ende weg geschrieben werden.
        // this.writer.write(dao);
      } else {
        console.log("Du hast keinen writer definiert.");
      }
    }
  }

  run(): void {
    if (this.reader != null) {
      // Der Reader muss die DAOs häppchenweise weiter geben.
      this.reader.observer.add_observer(this);
      this.reader.read(); // and send do_command
    } else {
      console.log("Du hast keinen reader definiert.");
    }
  }
}
