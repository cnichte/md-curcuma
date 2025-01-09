// TODO https://github.com/jxson/front-matter
var fm = require("front-matter");
// TODO https://eemeli.org/yaml/#yaml
import { stringify } from "yaml";

/**
 * Frontmatter is separated from the rest of the text for easier processing.
 *
 * content.attributes - contains the extracted yaml attributes in json form
 * content.body - contains the string contents below the yaml separators
 * content.bodyBegin - contains the line number the body contents begins at
 * content.frontmatter - contains the original yaml string contents
 * @export
 * @interface MD_FileContent_Interface
 */
export interface MD_FileContent_Interface {
  frontmatter: string;
  frontmatter_attributes: any;
  body_array: string[];
  index: number;
}

export class MD_FileContent implements MD_FileContent_Interface {
  frontmatter: string = "";
  frontmatter_attributes: any = "";
  body_array: string[] = [];
  index: number = 0;

  /**
   * Split a file in frontmatter and content-body.
   *
   * @static
   * @param {string} content
   * @return {*}  {MD_FileContent_Interface}
   * @memberof Filesystem
   */
  public static split_frontmatter_body(
    content: string
  ): MD_FileContent_Interface {
    const fm_content = fm(content);

    const file_content: MD_FileContent_Interface = {
      frontmatter: fm_content.frontmatter,
      frontmatter_attributes: fm_content.attributes,
      body_array: fm_content.body.split("\n"),
      index: 0,
    };
    return file_content;
  }

  /**
   * Merge frontmatter and content-body into a file-content.
   *
   * @static
   * @param {MD_FileContent_Interface} mdfc
   * @return {*}  {string}
   * @memberof Filesystem
   */
  public static merge_frontmatter_body(mdfc: MD_FileContent_Interface): string {
    mdfc.frontmatter = stringify(mdfc.frontmatter_attributes);
    return (
      "---\n" + mdfc.frontmatter + "\n---\n\n" + mdfc.body_array.join("\n")
    );
  }
}
