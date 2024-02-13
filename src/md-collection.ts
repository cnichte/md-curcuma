import { MD_Frontmatter_Template, MD_Frontmatter_Type } from "./md-frontmatter";
import { MD_Filesystem } from "./md-filesystem";

/**
 * A collection contains everything that makes up a single document.
 *
 * @author Carsten Nichte - 2024
 */

export interface MD_Collection_Parameter_Type {
  split_row: string;
  cleanName: string;
  url_prefix: string;
  useCounter: boolean;
  counter: number;
  frontmatter: MD_Frontmatter_Template;
}

export class MD_Collection {
  public headline: string = "";

  public url_prefix: string = "prefix";
  public url: string = "";

  public file_name: string = "";
  public file_content: string = "";

  public nr: number = 0;
  public weight: number = 8011;

  public date: string = new Date().toJSON().slice(0, 16);

  /**
   * Creates an instance of MD_Collection.
   * @param {MD_Collection_Parameter_Type} parameter
   * @memberof MD_Collection
   */
  constructor(parameter: MD_Collection_Parameter_Type) {
    this.url_prefix = parameter.url_prefix;

    this.headline = parameter.split_row.replace(parameter.cleanName, "").trim();
    if (this.headline.length <= 0) {
      this.headline = "This Headline has no Text"; // TODO This should produce an error or warning.
    }

    this.url = this.headline
      .replace(":", "-")
      .replace("&", "-")
      .replace(",", "-")
      .replace(" - ", "-")
      .replace(/ /g, "-")
      .toLowerCase();

    this.url = this.url.replace("---", "-").replace("--", "-");
    this.file_name = parameter.useCounter
      ? parameter.counter + "-" + this.url
      : (this.file_name = this.url);
    this.file_name = this.file_name + ".md";

    var weight = this.weight + parameter.counter;

    var frontmatter_props: MD_Frontmatter_Type = {
      title: this.headline,
      date: this.date,
      url: this.url,
      url_prefix: this.url_prefix,
      uuid: this.generateUUID(),
      weight: weight,
    };

    this.file_content = parameter.frontmatter.getFrontmatter(frontmatter_props);

    console.log(
      `${parameter.counter} - Splitting at '${this.headline}' with weight ${weight}`
    );
  }

  /**
   * Add Content to the Collection.
   *
   * @param {string} content
   * @memberof MD_Collection
   */
  public add_content(content: string): void {
    var newline = "\n" + content;
    this.file_content += newline;
  }

  /**
   * Write the Collection to thwe filesystem.
   *
   * @param {string} writePath
   * @memberof MD_Collection
   */
  public write_file(writePath: string): void {
    MD_Filesystem.write_file(writePath + this.file_name, this.file_content);
  }

  /**
   ** Generate a UUID.
   * https://stackoverflow.com/questions/105034/how-do-i-create-a-guid-uuid
   *
   * @private
   * @return {*}  {string}
   * @memberof MD_Splitter
   */
  private generateUUID(): string {
    // Public Domain/MIT
    var d = new Date().getTime(); // Timestamp
    var d2 =
      (typeof performance !== "undefined" &&
        performance.now &&
        performance.now() * 1000) ||
      0; // Time in microseconds since page-load or 0 if unsupported
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function (c) {
        var r = Math.random() * 16; // random number between 0 and 16
        if (d > 0) {
          // Use timestamp until depleted
          r = (d + r) % 16 | 0;
          d = Math.floor(d / 16);
        } else {
          // Use microseconds since page-load if supported
          r = (d2 + r) % 16 | 0;
          d2 = Math.floor(d2 / 16);
        }
        return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
      }
    );
  }
}
