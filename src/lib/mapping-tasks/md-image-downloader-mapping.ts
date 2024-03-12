import { CSV_Exporter } from "../csv-exporter";
import { MD_Filesystem } from "../md-filesystem";
import { MD_MappingTask, MD_MappingTask_Properties } from "../md-mapping";

import path = require("node:path");
import url = require("node:url");
import { v4 as uuidv4 } from "uuid";

export interface MD_ImageDownloader_MappingType {
  image_target_folder: string;
  image_hugo_path: string;
  filename_property_name: string;
  simulate: boolean;
}

export class MD_ImageDownloader_Mapping implements MD_MappingTask {
  protected properties: MD_ImageDownloader_MappingType;

  constructor(properties: MD_ImageDownloader_MappingType) {
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
  perform(mapping_properties: MD_MappingTask_Properties): string {
    let image_url = mapping_properties.source_value;
    let image_target_folder = this.properties.image_target_folder;
    let image_hugo_path = this.properties.image_hugo_path;

    if (CSV_Exporter.is_valid_url(image_url)) {
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

      image_target_folder = MD_Filesystem.concat_path_filename(
        image_target_folder,
        image_name
      );
      image_hugo_path = MD_Filesystem.concat_path_filename(
        image_hugo_path,
        image_name
      );

      console.log(
        `Try to download from url: '${image_url}' to '${image_target_folder}'...`
      );

      if (!this.properties.simulate) {
        CSV_Exporter.download_image(image_url, image_target_folder)
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
}
