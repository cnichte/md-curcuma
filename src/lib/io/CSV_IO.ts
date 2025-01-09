//! Das ist der alte CSV_Transporter
import {
  Observable,
  Observer_Interface,
  Observer_Props,
  Observer_Subject,
  Observer_Type,
} from "../core/observer";

import { Filesystem } from "../core/filesystem";

// import { Mapping_Macher, Mapping_XXX_Interface, Mapping_Item  } from "../tasks/Mapping_Task";

import * as fs from "fs";
import client_http = require("http");
import client_https = require("https");
import { URL } from "url";
import { DAO_Interface, IO_Observable_Interface } from "./types";


export interface CSV_IO_Props_Interface {
  readPath: string; // Datei oder Verzeichnis
  writePath: string; // Verzeichnis
  csvSeparator: string;
  // mappings?: Mapping<Mapping_Item>[]; 
}

/**
 * Könnte durch Xlsx_IO abgelöst werden.
 */
export class CSV_IO<D> implements IO_Observable_Interface<D>, Observable<D> {
  // Der reader löst ein Event aus, auf das der Runner hört.
  // Der reader schickt so die file-datensätze nacheinander zu weiteren Verarbeitung.
  private observer_subject: Observer_Subject<D> = new Observer_Subject<D>();

  private props: CSV_IO_Props_Interface = null;

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

  /**
   *
   * @param props
   * @returns
   */
  read(): void {

    let csv_buffer = fs.readFileSync(this.props.readPath);
    const rows_array = csv_buffer.toString().split("\n");

    let json_obj_array = [];

    // The array[0] contains all the header columns so we store them in header_array
    // consider commas within quotation marks: 1, "A, B, C", 2, 3
    const header_csv = rows_array[0];
    let header_array = new Array();

    if (header_csv.trim().length > 0) {
      let inSQuotes = false;
      let inDQuotes = false;
      let tmpParam = "";

      for (let i = 0; i < header_csv.length; ++i) {
        const char = header_csv.substring(i, i + 1);
        if (char == "'") inSQuotes = inSQuotes ? false : !inDQuotes;
        else if (char == '"') inDQuotes = inDQuotes ? false : !inSQuotes;
        if (char == ",") {
          if (inSQuotes) tmpParam += char;
          else if (inDQuotes) tmpParam += char;
          else {
            header_array.push(CSV_IO.cleanup(tmpParam));
            tmpParam = "";
          }
        } else tmpParam += char;
      }
      
      header_array.push(CSV_IO.cleanup(tmpParam));
    }

    for (let i = 1; i < rows_array.length - 1; i++) {
      let json_obj: any = {};

      let str: string = rows_array[i];
      let s: string = "";

      // Commas within quotation marks 1, "A, B, C", 2, 3
      // Commas remain inside the quotation marks.
      // Outside the quotation marks, replace separators with pipe |.
      let flag = 0;
      for (let ch of str) {
        if (ch === '"' && flag === 0) {
          flag = 1;
        } else if (ch === '"' && flag == 1) flag = 0;
        if (ch === "," && flag === 0) ch = "|";
        if (ch !== '"') s += ch;
      }

      // Split the string using pipe delimiter |
      // and store the values in a properties array
      let properties = s.split("|");

      for (let j in header_array) {
        json_obj[header_array[j]] = properties[j];
      }

      // TODO Mapper_Task: apply mappings to json object...
      
      
      //TODO Mapping_Task ausgliedern
/*
      if (this.props.hasOwnProperty("mappings")) {
        let mapper = new Mapping_Macher<Mapping_Item>();
        mapper.addMappings(this.props.mappings);
        mapper.do_mappings(json_obj, json_obj);
      }

      json_obj_array.push(json_obj);
*/
    }


    
    // let json = JSON.stringify(json_obj_array, null, 4);
    // fs.writeFileSync(this.props.writePath, json);
  }

  write(dao: DAO_Interface<D>): void {
    throw new Error("Method not implemented.");
  }























  /**
     * The BookBuddy app exports its contents as a csv file.
     * I would like to use the data in Hugo.
     * To do this, I convert the csv to json.
     *
     * @static
     * @param {string} source
     * @param {string} target
     * @memberof Tools
     */
    public static transform_to_json(
      job_parameter: CSV_IO_Props_Interface
    ): void {
      let csv_buffer = fs.readFileSync(job_parameter.readPath);
      const rows_array = csv_buffer.toString().split("\n");
  
      let json_obj_array = [];
  
      // The array[0] contains all the header columns so we store them in header_array
      // consider commas within quotation marks: 1, "A, B, C", 2, 3
      const header_csv = rows_array[0];
      let header_array = new Array();
  
      if (header_csv.trim().length > 0) {
        let inSQuotes = false;
        let inDQuotes = false;
        let tmpParam = "";
  
        for (let i = 0; i < header_csv.length; ++i) {
          const char = header_csv.substring(i, i + 1);
          if (char == "'") inSQuotes = inSQuotes ? false : !inDQuotes;
          else if (char == '"') inDQuotes = inDQuotes ? false : !inSQuotes;
          if (char == ",") {
            if (inSQuotes) tmpParam += char;
            else if (inDQuotes) tmpParam += char;
            else {
              header_array.push(CSV_IO.cleanup(tmpParam));
              tmpParam = "";
            }
          } else tmpParam += char;
        }
        
        header_array.push(CSV_IO.cleanup(tmpParam));
      }
  
      for (let i = 1; i < rows_array.length - 1; i++) {
        let json_obj: any = {};
  
        let str: string = rows_array[i];
        let s: string = "";
  
        // Commas within quotation marks 1, "A, B, C", 2, 3
        // Commas remain inside the quotation marks.
        // Outside the quotation marks, replace separators with pipe |.
        let flag = 0;
        for (let ch of str) {
          if (ch === '"' && flag === 0) {
            flag = 1;
          } else if (ch === '"' && flag == 1) flag = 0;
          if (ch === "," && flag === 0) ch = "|";
          if (ch !== '"') s += ch;
        }
  
        // Split the string using pipe delimiter |
        // and store the values in a properties array
        let properties = s.split("|");
  
        for (let j in header_array) {
          json_obj[header_array[j]] = properties[j];
        }
  

        // TODO Mapping_Task ausgliedern
        //* apply mappings to json object...
/*
        if (job_parameter.hasOwnProperty("mappings")) {
          let mapper = new Mapping_Macher<Mapping_Item>();
          mapper.addMappings(job_parameter.mappings);
          mapper.do_mappings(json_obj, json_obj);
        }
  */
        json_obj_array.push(json_obj);
      }
  
      let json = JSON.stringify(json_obj_array, null, 4);
      fs.writeFileSync(job_parameter.writePath, json);
    } // csv_to_json
  
    /**
     *
     *
     * @static
     * @param {string} source_file
     * @param {string} target_folder
     * @param {string} url_property_name
     * @memberof CVS_Exporter
     */
    public static download_all_images_from_json(
      source_file: string,
      target_folder: string,
      url_property_name: string
    ): void {
      let rawdata: Buffer = fs.readFileSync(source_file);
      let json: any = JSON.parse(rawdata.toString());
  
      if (Array.isArray(json)) {
        json.forEach((element) => {
          if (url_property_name in element) {
            let url: string = element[url_property_name];
  
            if (CSV_IO.is_valid_url(url)) {
              // url = url.replace('http://','https://');
              target_folder = target_folder.endsWith("/")
                ? target_folder
                : `${target_folder}/`;
  
              // I can't figure the data type out...
              const name: string =
                url.substring(url.lastIndexOf("/") + 1) + ".jpg"; // this isnt always jpg
              console.log(`Try Download from url: ${url}`);
  
              CSV_IO.download_image(url, `${target_folder}${name}`)
                .then(function (result) {
                  element.Cover_Image = `${target_folder}${name}`;
                  fs.writeFileSync(source_file, JSON.stringify(json, null, 4));
                })
                .catch(console.error);
            } else {
              console.log(`Download url invalid: ${url}`);
            }
          }
        });
      } else {
        // todo single object
      }
    }
  
    /**
     *
     * @static
     * @param {(string | client.RequestOptions | URL)} url
     * @param {fs.PathLike} filepath
     * @return {*}
     * @memberof Tools
     */
    public static download_image(url: string, filepath: fs.PathLike) {
      return new Promise((resolve, reject) => {
        let client = url.startsWith("https://") ? client_https : client_http;
  
        client.get(url, (response) => {
          if (response.statusCode === 200) {
            let write_stream = fs.createWriteStream(filepath);
            response
              .pipe(write_stream)
              .on("error", reject)
              .once("close", () => resolve(filepath));
          } else {
            // Consume response data to free up memory
            response.resume();
            reject(
              new Error(
                `Download from ${url} Failed With Status Code: ${response.statusCode}`
              )
            );
          }
        });
      });
    }
  
    public static is_valid_url_protocol(url: string) {
      try {
        const newUrl = new URL(url);
        return newUrl.protocol === "http:" || newUrl.protocol === "https:";
      } catch (err) {
        return false;
      }
    }
  
    public static is_valid_url(url: string): boolean {
      try {
        const myURL = new URL(url);
        return true;
      } catch (error) {
        console.log(`${error.input} is not a valid url`);
        return false;
      }
    }
  
    /**
     * trim('|hello|world|', '|'); // => 'hello|world'
     *
     * @static
     * @param {string} str
     * @param {string} ch
     * @return {*} 
     * @memberof CSV_Exporter
     */
    public static trim_char(str:string, ch:string) {
      var start = 0,
        end = str.length;
  
      while (start < end && str[start] === ch) ++start;
  
      while (end > start && str[end - 1] === ch) --end;
  
      return start > 0 || end < str.length ? str.substring(start, end) : str;
    }
  
    /**
     * The property names must be clean.
     * no characters like: ( );:.", 
     *
     * @static
     * @param {string} str
     * @return {*} 
     * @memberof CSV_Exporter
     */
    public static cleanup(str:string) {
      // str = CSV_Exporter.trim_char(str, '"'); // entfernt umschließende " 
      str = str.replace(/[(),"-]/g, ''); // '()-' -> ''
      str = str.replace(/[ ]/g, '_'); // ',; ' -> _
      return str
    }
  
    /**
     *
     *
     * @static
     * @param {(string | URL | Request)} url
     * @param {((arg0: string | ArrayBuffer) => void)} callback
     * @memberof Tools
     */
    public static imageToBase64(
      url: string | URL | Request,
      callback: (arg0: string | ArrayBuffer) => void
    ) {
      fetch(url)
        .then((response) => response.blob())
        .then((blob) => {
          const reader = new FileReader();
          reader.readAsDataURL(blob);
          reader.onloadend = () => {
            const base64String = reader.result;
            callback(base64String);
          };
        });
    }
}
