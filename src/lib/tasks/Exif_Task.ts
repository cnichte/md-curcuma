import * as ExifReader from "exifreader";

import { Data_Interface } from "../io/types";
import { Observable_Abstract_TaskBase } from "./Observable_Abstract_TaskBase";
import { Filesystem } from "../core";

export interface Exif_Task_Props {}

/**
 *
 */
export class Exif_Task<T> extends Observable_Abstract_TaskBase<T> {
  props: Exif_Task_Props;

  constructor(props: Exif_Task_Props) {
    super();
    this.props = props;
  }

  perform(dao: Data_Interface<T>): Data_Interface<T> {
    Exif_Task.get_tags(
      Filesystem.read_file_buffer(
        "test-data-exif/images/P7230231-Verbessert-SR.jpg"
      )
    ).then((tags: ExifReader.Tags) => {
      // TODO: EXIF tags da?
      console.log("############## EXIF Tags", tags);
      Exif_Task.list_tags(tags);
    });

    return dao;
  }

  public static async get_tags(
    file: ArrayBuffer | SharedArrayBuffer | Buffer
  ): Promise<ExifReader.Tags> {
    return new Promise((resolve, reject) => {
      // https://mattiasw.github.io/ExifReader/global/
      ExifReader.load(file || file, { async: true })
        .then(function (tags: any) {
          // The MakerNote tag can be really large. Remove it to lower
          // memory usage if you're parsing a lot of files and saving the
          // tags.
          delete tags["MakerNote"];

          // If you want to extract the thumbnail you can use it like
          // this:
          if (tags["Thumbnail"] && tags["Thumbnail"].image) {
            // var image = document.getElementById("thumbnail");
            // image.classList.remove("hidden");
            // image.src = "data:image/jpg;base64," + tags["Thumbnail"].base64;
          }
          // Use the tags now present in `tags`.

          // const imageDate = tags["DateTimeOriginal"].description;
          // const unprocessedTagValue = tags["DateTimeOriginal"].value;
          resolve(tags);
        })
        .catch(function (error: any) {
          // TODO Handle error.
          reject(error);
        });
    }); // Promise
  } // get

  public static list_tags(tags: any): void {
    // ExifReader.Tags
    for (const group in tags) {
      for (const name in tags[group]) {
        if (group === "gps") {
          console.log(`${group}:${name}: ${tags[group][name]}`);
        } else if (group === "Thumbnail" && name === "type") {
          console.log(`${group}:${name}: ${tags[group][name]}`);
        } else if (group === "Thumbnail" && name === "image") {
          console.log(`${group}:${name}: <image>`);
        } else if (group === "Thumbnail" && name === "base64") {
          console.log(`${group}:${name}: <base64 encoded image>`);
        } else if (group === "mpf" && name === "Images") {
          console.log(
            `${group}:${name}: ${Exif_Task.get_mpf_images_description(
              tags[group][name]
            )}`
          );
        } else if (group === "xmp" && name === "_raw") {
          console.log(`${group}:${name}: <XMP data string>`);
        } else if (group === "exif" && name === "ImageSourceData") {
          console.log(`${group}:${name}: <Adobe data>`);
        } else if (Array.isArray(tags[group][name])) {
          console.log(
            `${group}:${name}: ${tags[group][name]
              .map((item) => item.description)
              .join(", ")}`
          );
        } else {
          console.log(
            `${group}:${name}: ${
              typeof tags[group][name] === "string"
                ? tags[group][name].trim()
                : JSON.stringify(tags[group][name])
            }`
          );
        }
      }
    }
  }

  private static get_mpf_images_description(images: any) {
    return images
      .map(
        (image: { [x: string]: { description: any } }, index: any) =>
          `(${index}) ` +
          Object.keys(image)
            .map((key) => {
              if (key === "image") {
                return `${key}: <image>`;
              }
              if (key === "base64") {
                return `${key}: <base64 encoded image>`;
              }
              return `${key}: ${image[key].description}`;
            })
            .join(", ")
      )
      .join("; ");
  }
}
