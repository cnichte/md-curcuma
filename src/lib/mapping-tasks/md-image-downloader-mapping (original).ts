import { CSV_Exporter } from "../csv-exporter";
import { MD_MappingTask, MD_MappingTask_Properties } from "../md-mapping";

import path = require("node:path");
import url = require("node:url");
import { v4 as uuidv4 } from "uuid";

export interface MD_ImageDownloader_MappingType {
  image_folder: string;
  filename_property_name: string;
  simulate: boolean;
}

export class MD_ImageDownloader_Mapping implements MD_MappingTask {
  protected properties: MD_ImageDownloader_MappingType;

  constructor(properties: MD_ImageDownloader_MappingType) {
    this.properties = properties;
  }

  private is_valid_url(url: string): boolean {
    try {
      const myURL = new URL(url);
      return true;
    } catch (error) {
      console.log(`${error.input} is not a valid url`);
      return false;
    }
  }

  /**
   * Ich hätte hier gerne das gesamte objekt?
   * Die Property namen (und die Werte)
   * das wäre flexibler
   * und ich wüsste hier worum es geht...
   *
   * @param {string} source_value
   * @param {string} target_value
   * @return {*}  {string}
   * @memberof MD_ImageDownloader_Mapping
   */
  perform(mapping_properties: MD_MappingTask_Properties): string {

    let source_value = mapping_properties.source_value;
    let target_value = mapping_properties.target_value;

    if (this.is_valid_url(source_value)) {
      const image_url = source_value;
      const myURL = new URL(source_value);

      let name: string = "";

      if (myURL)
        if (myURL.pathname.indexOf(".") > 0) {
          // the path ends with a file name
          name = myURL.pathname.substring(
            myURL.pathname.lastIndexOf("/"),
            myURL.pathname.length
          );
        } else {
          // The path ends without a filename
          // i suggest, but this isnt always jpg
          name = image_url.substring(image_url.lastIndexOf("/") + 1) + ".jpg";
        }

      console.log(`#################################: ${name}`);

      // TODO für file_namen eine eigene UUID bilden, und die abspeichern
      let uuid = mapping_properties.source[this.properties.filename_property_name];

      // uuidv4();

      // TODO https://nodejs.org/api/path.html ??
      // https://nodejs.org/api/url.html

      target_value = `${this.properties.image_folder}${name}`;
      target_value = target_value.endsWith("/")
        ? target_value
        : `${target_value}/`;
      console.log(
        `Try to download from url: '${image_url}' to '${target_value}'...`
      );

      if (!this.properties.simulate) {
        CSV_Exporter.download_image(image_url, target_value)
          .then(function (result) {
            console.log(
              `Downloaded from url: '${image_url}' to '${target_value}' with result '${result}'`
            );
          })
          .catch(console.error);
      }
    } // is_url_valid

    return target_value;
  }
}
