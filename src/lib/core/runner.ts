import { Json_IO_Reader, Markdown_IO_Reader } from "../io";
import {
  IO_Observable_Reader_Interface,
  IO_Observable_Writer_Interface,
} from "../io/types";
import { Task_Interface } from "../tasks";
import { Observer_Interface, Observer_Props, Observer_Type } from "./observer";

export interface Runner_Interface<D> extends Observer_Interface<D> {
  addTask(task: Task_Interface<D>): void;
  addReader(reader: IO_Observable_Reader_Interface<D>): void;
  addWriter(writer: IO_Observable_Writer_Interface<D>): void;
  run(): void;
  do_command(props: Observer_Props<D>): void; // eigentlich do_reader_command
  get_observer_id(): Observer_Type;
}

export class Runner<D> implements Runner_Interface<D> {
  private tasks: Task_Interface<D>[] = [];
  private reader: IO_Observable_Reader_Interface<D> = null;
  private writer: IO_Observable_Writer_Interface<D> = null;

  addTask(task: Task_Interface<D>): void {
    this.tasks.push(task);
  }

  addReader(reader: IO_Observable_Reader_Interface<D>): void {
    this.reader = reader;
  }

  addWriter(writer: IO_Observable_Writer_Interface<D>): void {
    this.writer = writer;
  }

  /**
   * Listen to Reades, Writers and Tasks for actions.
   *
   * @param props
   */
  do_command(props: Observer_Props<D>): void {
    if (
      //! props.from === "markdown-io" &&
      props.to === "runner" &&
      props.command === "perform-tasks"
    ) {
      console.log(
        "### runner.do_command received props: ",
        props.from,
        props.to,
        props.command // props.dao
      );

      //! alle Tasks anwenden
      for (let task of this.tasks) {
        
        // TODO: TASK Observer
        task.add_observer(this, this.get_observer_id());

        // (dao:DAO_Interface<D>)
        task.perform(props.dao);

        //TODO: WAT - write after Task - brauch ich das wirklich?
      }

      // Am Ende aller Tasks das Ergebnis einmal wegschreiben...
      //TODO Nach jedem DAO mit dem Writer schreiben, es sei denn 'do-not-io-write'
      if (this.writer != null) {
         this.writer.write(props.dao);
       }

      } else if (
        // props.from === "md-splitter-task" &&
        props.to === "runner" &&
        props.command === "do-not-io-write"
      ) {

        // macht einfach nix?

    } else if (
      //! props.from === "markdown-io" &&
      props.to === "runner" &&
      props.command === "tasks-finished"
    ) {
      // TODO nach dem letzten dao schreiben
      console.log("################## FERTIG, FÜHRE WRITE AUS!!!");

      if (this.writer != null) {
        // TODO: Was schreiben? da müsste was übergeben werden... meta, data, etc
        // TODO: Benutze IO_Meta_Interface ????
        // normalerweise sammelt man vielleicht, und akkumliert daten auf
        // die am Ende weg geschrieben werden.
        //!!! this.writer.write(props.dao);
      } else {
        console.log("Du hast keinen writer definiert!");
      }

    } else {
      console.log("runner.do_command received UNKNOWN props: ", props.from, props.to, props.command);
    }
  }

  /**
   * Run the runner.
   */
  run(): void {
    if (this.reader != null) {
      // Der Reader muss die DAOs häppchenweise weiter geben.
      this.reader.add_observer(this, "runner");
      this.reader.read(); // read all files and send do_command
    } else {
      console.log("Du hast keinen reader definiert.");
    }
  }

  get_observer_id(): Observer_Type {
    return "runner";
  }
}
