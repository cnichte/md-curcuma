import { MD_Mapping } from "./md-mapping";
import { MD_Template } from "./md-template";

// TODO mapping ???
export interface MD_Frontmatter_Parameter_Type {
  frontmatter_filename: string;
  frontmatter: MD_Frontmatter_Template;
  mappings: MD_Mapping[];
}

/**
 * Describes the possible placeholders that can be replaced in the template:
 * Template = `I have a {title} and a {date}.`
 *
 * @export
 * @interface MD_Frontmatter_Type
 */
export interface MD_Frontmatter_Type {
  title: string;
  date: string;
  url: string;
  url_prefix: string;
  uuid: string;
  weight: number;
}

/**
 * Providing a Frontmatter in Hugo Style.
 *
 * TODO Frontmatter in der Quelldatei
 *  - aus dem ziel entferne, aber fürs
 *  - berücksichtigen durch mapping
 * Kein Frontmatter in der Quelldatei
 *  - Füge frontmatter template hinzu.
 *
 *
 * @export
 * @class MD_Frontmatter
 */
export class MD_Frontmatter_Template extends MD_Template {
  /**
   * Fills the template with values from the MD_Frontmatter_Type object.
   *
   * @param {(MD_Frontmatter_Type)} values
   * @return {*}  {string}
   * @memberof MD_Frontmatter
   */
  getFrontmatter(values: MD_Frontmatter_Type): string {
    return this.fill(values);
  }
}
