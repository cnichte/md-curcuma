import { Mapper_Properties, Mapper_Task_Interface } from "../../core/mapper";

import path = require("node:path");
import url = require("node:url");
import { v4 as uuidv4 } from "uuid";
import { Filesystem } from "../../core/filesystem";

import * as fs from "fs";
import client_http = require("http");
import client_https = require("https");
import { URL } from "url";
export interface ImageDownloader_MappingType {
  image_target_folder: string;
  image_hugo_path: string;
  filename_property_name: string;
  simulate: boolean;
}

export class ImageDownloader_Mapping implements Mapper_Task_Interface {
  protected properties: ImageDownloader_MappingType;

  constructor(properties: ImageDownloader_MappingType) {
    this.properties = properties;
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
  perform(mapping_properties: Mapper_Properties): string {
    // get the value from the property-name
    let source_property_name = mapping_properties.source_property_name;
    let source_property_value = mapping_properties.source.data[source_property_name];

    let image_url = source_property_value; // mapping_properties.source_value;
    let image_target_folder = this.properties.image_target_folder;
    let image_hugo_path = this.properties.image_hugo_path;

    if (ImageDownloader_Mapping.is_valid_url(image_url)) {
      const myURL = new URL(image_url);

      let image_name: string = "";

      if (myURL)
        if (myURL.pathname.indexOf(".") > 0) {
          // the path ends with a file name
          image_name = myURL.pathname.substring(
            myURL.pathname.lastIndexOf("/"),
            myURL.pathname.length
          );
        } else {
          // The path ends without a filename
          // i suggest, but this isnt always jpg
          image_name =
            image_url.substring(image_url.lastIndexOf("/") + 1) + ".jpg";
        }

      // TODO für file_namen eigene UUIDs bilden...
      let uuid = uuidv4();
      if (
        mapping_properties.source.hasOwnProperty(
          this.properties.filename_property_name
        )
      ) {
        uuid =
          mapping_properties.source[this.properties.filename_property_name];
      }

      // TODO https://nodejs.org/api/path.html ??
      // https://nodejs.org/api/url.html

      image_target_folder = Filesystem.concat_path_filename(
        image_target_folder,
        image_name
      );
      image_hugo_path = Filesystem.concat_path_filename(
        image_hugo_path,
        image_name
      );

      console.log(
        `Try to download from url: '${image_url}' to '${image_target_folder}'...`
      );

      if (!this.properties.simulate) {
        ImageDownloader_Mapping.download_image(image_url, image_target_folder)
          .then(function (result) {
            console.log(
              `Downloaded from url: '${image_url}' to '${image_target_folder}' with result '${result}'`
            );
          })
          .catch(console.error);
      }
    } // is_url_valid
    else {
      image_hugo_path = "";
    }

    return image_hugo_path;
  }

  private static is_valid_url_protocol(url: string) {
    try {
      const newUrl = new URL(url);
      return newUrl.protocol === "http:" || newUrl.protocol === "https:";
    } catch (err) {
      return false;
    }
  }

  private static is_valid_url(url: string): boolean {
    try {
      const myURL = new URL(url);
      return true;
    } catch (error) {
      console.log(`${error.input} is not a valid url`);
      return false;
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
  private static download_image(url: string, filepath: fs.PathLike) {
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
}
