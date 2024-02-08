import { MD_Template } from "./md-splitter-utils";

/**
 * Describes the possible placeholders that can be replaced in the template:
 * Template = `I have a {title} and a {date}.`
 * 
 * @export
 * @interface MD_FrontmatterType
 */
export interface MD_FrontmatterType {
  title: string;
  date: string;
  url: string;
  url_prefix: string;
  uuid: string;
  weight: number;
}

/**
 * Providing a Frontmatter in Hugo Style.
 * @export
 * @class MD_Frontmatter
 */
export class MD_Frontmatter extends MD_Template{

  /**
   * Fills the template with values from the MD_FrontmatterType object.
   * 
   * @param {(MD_FrontmatterType)} values
   * @return {*}  {string}
   * @memberof MD_Frontmatter
   */
  getFrontmatter(values: MD_FrontmatterType): string {
    return this.fill(values);
  }
}
