import * as fs from "fs";
import client_http = require("http");
import client_https = require("https");
import { URL } from "url";
import { MD_Mapper, MD_Mapping } from "./md-mapping";

export interface CSV_Transporter_Parameter_Type {
  readPath: string; // Datei oder Verzeichnis
  writePath: string; // Verzeichnis
  csvSeparator: string;
  mappings?: MD_Mapping[];
}

export class CSV_Transporter {
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
    job_parameter: CSV_Transporter_Parameter_Type
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
            header_array.push(CSV_Transporter.cleanup(tmpParam));
            tmpParam = "";
          }
        } else tmpParam += char;
      }
      
      header_array.push(CSV_Transporter.cleanup(tmpParam));
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

      //* apply mappings to json object...
      if (job_parameter.hasOwnProperty("mappings")) {
        let mapper: MD_Mapper = new MD_Mapper();
        mapper.addMappings(job_parameter.mappings);
        mapper.do_mappings(json_obj, json_obj);
      }

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

          if (CSV_Transporter.is_valid_url(url)) {
            // url = url.replace('http://','https://');
            target_folder = target_folder.endsWith("/")
              ? target_folder
              : `${target_folder}/`;

            // I can't figure the data type out...
            const name: string =
              url.substring(url.lastIndexOf("/") + 1) + ".jpg"; // this isnt always jpg
            console.log(`Try Download from url: ${url}`);

            CSV_Transporter.download_image(url, `${target_folder}${name}`)
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
} // class CSV_Transporter
