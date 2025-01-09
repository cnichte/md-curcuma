import { v4 as uuidv4 } from "uuid";
import { MD_Frontmatter_Template, MD_Frontmatter_Type } from "./MD_Frontmatter_Template";
import { Filesystem } from "../../../core/filesystem";

/**
 * MD_Document contains everything that makes up a single Markdown-Document.
 *
 * @author Carsten Nichte - 2024
 */

export interface MD_Document_Parameter_Type {
  split_row: string;
  cleanName: string;
  url_prefix: string;
  useCounter: boolean;
  weightBase: number;
  counter: number;
  frontmatter: MD_Frontmatter_Template;
}

export class MD_Document {
  public headline: string = "";

  public url_prefix: string = "prefix";
  public url: string = "";

  public file_name: string = "";
  public file_content: string = "";

  public nr: number = 0;
  public weight: number = 8011;

  public date: string = new Date().toJSON().slice(0, 16);

  /**
   * Creates an instance of MD_Document.
   * @param {MD_Document_Parameter_Type} parameter
   * @memberof MD_Document
   */
  constructor(parameter: MD_Document_Parameter_Type) {
    
    this.url_prefix = parameter.url_prefix;
    this.weight = parameter.weightBase;

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
      uuid: uuidv4(),
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
   * @memberof MD_Document
   */
  public add_content(content: string): void {
    var newline = "\n" + content;
    this.file_content += newline;
  }

  /**
   * Write the Collection to thwe filesystem.
   *
   * @param {string} writePath
   * @memberof MD_Document
   */
  public write_file(writePath: string): void {
    Filesystem.write_file_txt(writePath + this.file_name, this.file_content);
  }
}
