import {
  Observable,
  Observer_Interface,
  Observer_Props,
  Observer_Subject,
  Observer_Type,
} from "../core/observer";

import {
  Data_Interface,
  IO_Meta,
  IO_Observable_Reader_Interface,
  IO_Observer_Props,
} from "./types";

import * as fs from "fs";
import { Options, parse } from "csv-parse";

export interface CSV_IO_Props_Interface {
  path: string; // Datei oder Verzeichnis
  delimiter: string; // z. B. ","
  columns: boolean; // Erste Zeile als Header verwenden
  quote: string; // Anführungszeichen für Felder
  relax_quotes: boolean; // Flexiblere Handhabung von Anführungszeichen
  skip_records_with_error: boolean; // Fehlerhafte Zeilen überspringen
  trim: boolean; // Whitespace trimmen
}

/**
 * ! Das ist der alte CSV_Transporter
 * TODO: Könnte durch Xlsx_IO abgelöst werden.
 * https://csv.js.org
 * 
 */
export class CSV_IO_Reader<D>
  implements IO_Observable_Reader_Interface<D>, Observable<D>
{
  private observer_subject: Observer_Subject<D> = new Observer_Subject<D>();
  private props: CSV_IO_Props_Interface;

  constructor(props: CSV_IO_Props_Interface) {
    this.props = props;
  }

  add_observer(observer: Observer_Interface<D>, id: Observer_Type): void {
    this.observer_subject.add_observer(observer, id);
  }

  notify_all(props: Observer_Props<D>): void {
    this.observer_subject.notify_all(props);
  }

  notify(props: Observer_Props<D>): void {
    this.observer_subject.notify(props);
  }

  read(): void {
    
    let options: Options = {
      delimiter: this.props.delimiter, // z. B. ","
      columns: this.props.columns, // Erste Zeile als Header verwenden
      quote: this.props.quote, // Anführungszeichen für Felder
      relax_quotes: this.props.relax_quotes, // Flexiblere Handhabung von Anführungszeichen
      skip_records_with_error: this.props.skip_records_with_error, // Fehlerhafte Zeilen überspringen
      trim: this.props.trim, // Whitespace trimmen
    };

    const parser = fs.createReadStream(this.props.path).pipe(parse(options));

    parser.on("data", (row: any) => {
      let json_obj = row;

      let o_props = new IO_Observer_Props<D>();
      o_props.from = "csv-io";
      o_props.to = "runner";
      o_props.command = "perform-tasks";

      let io_meta = new IO_Meta();
      io_meta.file_list_reader = [this.props.path];
      io_meta.file_name_reader = this.props.path;

      let the_dao: Data_Interface<D> = {
        data: json_obj,
        io_meta: io_meta,
      };

      o_props.dao = the_dao;

      console.log("csv-io.do_command: perform tasks for", this.props.path);
      this.notify_all(o_props);
    });

    parser.on("end", () => {
      let m_props = new IO_Observer_Props<any>();
      m_props.from = "csv-io";
      m_props.to = "runner";
      m_props.command = "tasks-finished";
      this.notify_all(m_props);
    });

    parser.on("error", (err: any) => {
      console.error("Error parsing CSV:", err);
    });
  }

  private static cleanup(str: string) {
    str = str.replace(/[(),"-]/g, "");
    str = str.replace(/[ ]/g, "_");
    return str;
  }
}
