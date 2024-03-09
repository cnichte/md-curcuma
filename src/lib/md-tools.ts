import * as fs from "fs";
import client_http = require("http");
import client_https = require("https");
import { URL } from "url";

export class MD_Tools {
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
  public static csv_to_json(source: string, target: string): void {
    let csv_buffer = fs.readFileSync(source);
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
            header_array.push(tmpParam.split(" ").join("_"));
            tmpParam = "";
          }
        } else tmpParam += char;
      }
      header_array.push(tmpParam.split(" ").join("_"));
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

      // if a value contains multiple comma separated data store it in form of array 
      for (let j in header_array) {
        if (properties[j].includes(", ")) {
          json_obj[header_array[j]] = properties[j]
            .split(",")
            .map((item) => item.trim());
        } else json_obj[header_array[j]] = properties[j];
      }

      json_obj_array.push(json_obj);
    }

    let json = JSON.stringify(json_obj_array, null, 4);
    fs.writeFileSync(target, json);
  } // csv_to_json

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
          if (MD_Tools.is_valid_url(url)) {
            // url = url.replace('http://','https://');
            target_folder = target_folder.endsWith("/")
              ? target_folder
              : `${target_folder}/`;
            const name: string =
              url.substring(url.lastIndexOf("/") + 1) + ".jpg";
            console.log(`Try Download from url: ${url}`);

            MD_Tools.download_image(url, `${target_folder}${name}`)
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

      client.get(url, (res) => {
        if (res.statusCode === 200) {
          let ws = fs.createWriteStream(filepath);
          res
            .pipe(ws)
            .on("error", reject)
            .once("close", () => resolve(filepath));
        } else {
          // Consume response data to free up memory
          res.resume();
          reject(
            new Error(`Request Failed With a Status Code: ${res.statusCode}`)
          );
        }
      });
    });
  }

  public static is_valid_url(url: string) {
    try {
      const newUrl = new URL(url);
      return newUrl.protocol === "http:" || newUrl.protocol === "https:";
    } catch (err) {
      return false;
    }
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
} // class tools
