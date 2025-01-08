
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
}