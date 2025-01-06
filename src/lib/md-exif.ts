import * as ExifReader from "exifreader";

// https://github.com/mattiasw/ExifReader

export class MD_Exif {
  // TODO Teil eines md-copy-job -> copy_task
  
  // TODO Reader: Liest exif Daten aus Bildern --> Objekt.
  // TODO Mapper: Werte aus Dateinamen extrahieren --> Object --> in exif schreiben.
  // TODO Rename-Task: Am Ende ggfs. auch die Datei umbenennen.

 // filename-reader 
 // filename-splitter
 // filename-mapper / transformer
 // filename-writer

 // exif-reader 
 // exif-mapper 
 // exif-writer

  public static test(file: File) {
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onload = () => {
      MD_Exif.get_tags(reader.result as ArrayBuffer).then(
        (tags: ExifReader.Tags) => {
          // TODO: EXIF tags da?
          console.log("############## EXIF Tags", tags);
          MD_Exif.list_tags(tags);
        }
      );
    };
  }

  public static async get_tags(
    file: ArrayBuffer | SharedArrayBuffer | Buffer
  ): Promise<ExifReader.Tags> {
    return new Promise((resolve, reject) => {
      // https://mattiasw.github.io/ExifReader/global/
      ExifReader.load(file || file, { async: true })
        .then(function (tags) {
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
        .catch(function (error) {
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
            `${group}:${name}: ${MD_Exif.get_mpf_images_description(
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
