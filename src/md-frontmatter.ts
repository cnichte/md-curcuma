import { MD_Template } from "./md-template";
var fm = require('front-matter')

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

      // content.attributes - contains the extracted yaml attributes in json form
    // content.body - contains the string contents below the yaml separators
    // content.bodyBegin - contains the line number the body contents begins at
    // content.frontmatter - contains the original yaml string contents
export interface FileContent_Interface {
  attributes:any;
  body:string;
  bodyBegin:number
  frontmatter:string

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

export class MD_Frontmatter_Mapper {
  protected frontmatter_source: MD_Frontmatter_Template;
  protected frontmatter_target: MD_Frontmatter_Template;
  
  protected source_fm:any;

  constructor(source:string, target:string){

  }

  public has_frontmatter(content:any): boolean {
    var content: any = fm(content);
    // content.attributes - contains the extracted yaml attributes in json form
    // content.body - contains the string contents below the yaml separators
    // content.bodyBegin - contains the line number the body contents begins at
    // content.frontmatter - contains the original yaml string contents
    console.log(content)   



    return true;
  }



}