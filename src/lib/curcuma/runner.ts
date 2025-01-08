import { IO_Interface, Task_Interface } from "./types";
import { Observer_Interface, Observer_Props } from "./observer";

export interface Runner_Interface<D> extends Observer_Interface<D> {
  addTask(task: Task_Interface<D>): void;
  addReader(reader: IO_Interface<D>): void;
  addWriter(writer: IO_Interface<D>): void;
  run(): void;
  do_command(props: Observer_Props<D>): void; // eigentlich do_reader_command
}

export class Runner<D> implements Runner_Interface<D> {

  private tasks: Task_Interface<D>[] = [];
  private reader: IO_Interface<D> = null;
  private writer: IO_Interface<D> = null;

  addTask(task: Task_Interface<D>): void {
    this.tasks.push(task);
  }

  addReader(reader: IO_Interface<D>): void {
    this.reader = reader;
  }
  addWriter(writer: IO_Interface<D>): void {
    this.writer = writer;
  }

  /**
   * Listen to Reades, Writers and Tasks for actions.
   * 
   * @param props 
   */
  do_command(props: Observer_Props<D>): void {
    console.log("runner.do_command received props: ", props.from, props.to, props.command);

    if (
      props.from === "markdown-io" &&
      props.to === "runner" &&
      props.command === "perform-tasks"
    ) {
      //! alle Tasks anwenden
      for (let task of this.tasks) {
        task.perform(props.dao, props.io_meta);
        //TODO Nach jedem DAO mit dem writer schreiben (es sei denn 'do-not-io-write')
        if (this.writer != null) { // TODO && props.command === "do-io-write"
          this.writer.write(props.dao);
        }else{
          this.reader.write(props.dao);
        }
      }
    } else if (
      props.from === "markdown-io" &&
      props.to === "runner" &&
      props.command === "tasks-finnished"
    ) {

      // TODO nach dem letzten dao schreiben

      console.log("FERTIG, FÜHRE WRITE AUS!!!");
      if (this.writer != null) {
        // TODO: Was schreiben? da müsste was übergeben werden... meta, data, etc 
        // TODO: Benutze IO_Meta_Interface ????
        // normalerweise sammelt man vielleicht, und akkumliert daten auf
        // die am Ende weg geschrieben werden.
        this.writer.write(props.dao);
      } else {
        console.log("Du hast keinen writer definiert, benutze reader...");
        this.reader.write(props.dao);
      }
    }
  }

  /**
   * Run the runner.
   */
  run(): void {
    if (this.reader != null) {
      // Der Reader muss die DAOs häppchenweise weiter geben.
      this.reader.observer_subject.add_observer(this, 'runner');
      this.reader.read(); // and send do_command
    } else {
      console.log("Du hast keinen reader definiert.");
    }
  }
}