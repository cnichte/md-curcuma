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
export interface MD_FileContent_Interface {
  frontmatter:string;
  frontmatter_attributes:any;
  body_array:string[];
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
  protected file_content_source: MD_FileContent_Interface;
  protected file_content_target_template: MD_FileContent_Interface;
  
  constructor(source:any, target_template:any) {
    // content.attributes - contains the extracted yaml attributes in json form
    // content.body - contains the string contents below the yaml separators
    // content.bodyBegin - contains the line number the body contents begins at
    // content.frontmatter - contains the original yaml string contents
/*
    const fm_source = fm(source);

    this.file_content_source.body_array = fm_source.body.split("\n");
    this.file_content_source.frontmatter = fm_source.frontmatter;
    this.file_content_source.frontmatter_attributes = fm_source.attributes;

    const fm_target_template = fm(target_template);

    this.file_content_target_template.body_array = []; // fm_target_template.body.split("\n"); // eigentlich hat das keinen inhalt
    this.file_content_target_template.frontmatter = fm_target_template.frontmatter;
    this.file_content_target_template.frontmatter_attributes = fm_target_template.attributes;
*/
  }

  public has_source_frontmatter(): boolean {
    console.log(this.file_content_source); 
    return true;
  }

  public static get_md_fileContent_from(content:string): MD_FileContent_Interface{
    const fm_content = fm(content);

    const file_content:MD_FileContent_Interface = {
      frontmatter: fm_content.frontmatter,
      frontmatter_attributes: fm_content.attributes,
      body_array: fm_content.body.split("\n")
    }
    return file_content;

  } 

  public has_target_frontmatter(): boolean {
    console.log(this.file_content_target_template); 
    return true;
  }

  public perform_mapping(source: any, target: any){
    // Frontmatter Types
    // https://gohugo.io/content-management/front-matter/
    // TOML - identified by opening and closing +++
    //+YAML - identified by opening and closing ---
    // JSON - a single JSON object surrounded by ‘{’ and ‘}’, followed by a new line.
    // ORG  - #+KEY: VALUE’

 /*
    attributes: {
      title: 'Typoblindtext 2.2',
      docType: 'Recherche',
      doPublish: true,
      tags: [ 'DocType/Recherche' ]
    },
     body:
    bodyBegin: 9,
    frontmatter: als string
*/



  }

}