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
  run(): Promise<void>;
  do_command(props: Observer_Props<D>): void; // eigentlich do_reader_command
  get_observer_id(): Observer_Type;
}

/**
 * Callback der aufgerufen wird wenn alle Tasks fertig sind
 */
export type RunnerFinishedCallback = () => Promise<void> | void;

export class Runner<D> implements Runner_Interface<D> {
  private tasks: Task_Interface<D>[] = [];
  private reader: IO_Observable_Reader_Interface<D> = null;
  private writer: IO_Observable_Writer_Interface<D> = null;
  
  /**
   * Sammelt alle async write-Promises
   */
  private writePromises: Promise<void>[] = [];
  
  /**
   * Callback der aufgerufen wird wenn alles fertig ist
   */
  private onFinished: RunnerFinishedCallback | null = null;
  
  /**
   * Resolve-Funktion für das run()-Promise
   */
  private runResolve: (() => void) | null = null;

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
   * Registriert einen Callback der aufgerufen wird wenn alle Tasks fertig sind.
   * Nützlich für Cleanup-Operationen wie das Schließen von exiftool.
   */
  setOnFinished(callback: RunnerFinishedCallback): void {
    this.onFinished = callback;
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
      // Debug output removed

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
        // Write kann async sein - Promise sammeln
        const writeResult = this.writer.write(props.dao) as void | Promise<void>;
        if (writeResult && typeof (writeResult as Promise<void>).then === 'function') {
          this.writePromises.push(writeResult as Promise<void>);
        }
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
      // Alle Dateien wurden gelesen, jetzt finalisieren

      if (this.writer != null) {
        // TODO: Was schreiben? da müsste was übergeben werden... meta, data, etc
        // TODO: Benutze IO_Meta_Interface ????
        // normalerweise sammelt man vielleicht, und akkumliert daten auf
        // die am Ende weg geschrieben werden.
        //!!! this.writer.write(props.dao);
      }

      // Warte auf alle async write-Operationen und führe dann onFinished aus
      this.finishRun();

    } else {
      // Unknown command - ignore silently
    }
  }

  /**
   * Wartet auf alle async Operationen und führt Cleanup durch
   */
  private async finishRun(): Promise<void> {
    // Warte auf alle write-Promises
    if (this.writePromises.length > 0) {
      await Promise.all(this.writePromises);
    }

    // Führe onFinished-Callback aus
    if (this.onFinished) {
      await this.onFinished();
    }

    // Resolve das run()-Promise
    if (this.runResolve) {
      this.runResolve();
    }
  }

  /**
   * Run the runner.
   * Returns a Promise that resolves when all operations are complete.
   */
  async run(): Promise<void> {
    return new Promise<void>((resolve) => {
      this.runResolve = resolve;
      this.writePromises = [];

      if (this.reader != null) {
        // Der Reader muss die DAOs häppchenweise weiter geben.
        this.reader.add_observer(this, "runner");
        this.reader.read(); // read all files and send do_command
      } else {
        console.log("Du hast keinen reader definiert.");
        resolve();
      }
    });
  }

  get_observer_id(): Observer_Type {
    return "runner";
  }
}
