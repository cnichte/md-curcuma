import { MD_Exporter_Parameter_Type } from "../md-exporter";
import { MD_Filesystem } from "../md-filesystem";
import { MD_FileContent_Interface, MD_Frontmatter_Mapper, MD_Frontmatter_Template } from "../md-frontmatter";
import { MD_Observer_Interface } from "../md-observer";
import {
  MD_Transformer_AbstractBase,
} from "../md-transformer";

export interface MD_Frontmatter_Parameter_Type {
  frontmatter_filename: string;
  frontmatter: MD_Frontmatter_Template;
}

/**
 * Füge frontmatter zu kopierten Dateien hinzu. (nicht splitter)
 *
 * @export
 * @class MD_Frontmatter_Transformer
 * @extends {MD_Transformer_AbstractBase}
 */
export class MD_Frontmatter_Transformer extends MD_Transformer_AbstractBase {
  parameter: MD_Frontmatter_Parameter_Type;

  /**
   * Creates an instance of MD_Frontmatter_Transformer.
   * @param {MD_Frontmatter_Parameter_Type} parameter
   * @memberof MD_Frontmatter_Transformer
   */
  constructor(parameter: MD_Frontmatter_Parameter_Type) {
    super();
    this.parameter = parameter;
    this.parameter.frontmatter_filename = parameter.frontmatter_filename.trim();

    // file overwrites property parameter.frontmatter 
    if(parameter.frontmatter_filename.length>0 && MD_Filesystem.is_file_exist(parameter.frontmatter_filename)){
      console.log(`before: ${parameter.frontmatter}`);
      const frontmatter: MD_Frontmatter_Template = new MD_Frontmatter_Template("");
      frontmatter.load(parameter.frontmatter_filename);
      parameter.frontmatter = frontmatter;
      console.log(`after: ${parameter.frontmatter}`);
    }else{
      console.log(`file not found: ${parameter.frontmatter_filename}`);
      console.log(parameter.frontmatter);
    }
  }

  public add_observer(observer: MD_Observer_Interface){
    this.observer_subject.add_observer(observer);
  }

  /**
   *
   *
   * @param {MD_Exporter_Parameter_Type} job_paramter
   * @memberof MD_Frontmatter_Transformer
   */
  public set_job_parameter(job_paramter: MD_Exporter_Parameter_Type): void {
    super.set_job_parameter(job_paramter);
    // Das ist ein Hack.
    //? Eigentlich ist die Metode ja in der abstrakten Basisklasse vorhanden.
    // Sie wird aber nicht erkannt bei übergabe als Parameter. zB: function(task:MD_Transformer_Interface)
  }

  /**
   *
   *
   * @param {MD_FileContent_Interface} file_content
   * @param {number} index
   * @return {*}  {Array<string>}
   * @memberof MD_Frontmatter_Transformer
   */
  public transform(file_content: MD_FileContent_Interface, index: number): MD_FileContent_Interface {

    // The one is like this:
    // file_content: MD_FileContent_Interface
    file_content.frontmatter;
    file_content.frontmatter_attributes;

    // The other like this:
    // this.frontmatter_target: MD_Frontmatter_Template
    const template_content:MD_FileContent_Interface = MD_Frontmatter_Mapper.get_md_fileContent_from(this.parameter.frontmatter.get_template_string());
    template_content.frontmatter;
    template_content.frontmatter_attributes;

    console.log("###########################");
    console.log("----- Source FRONTMATTER");
    console.log(file_content.frontmatter);
    console.log("----- Source FRONTMATTER ATTRIBUTES");
    console.log(file_content.frontmatter_attributes);
    console.log("---------------------------");
    console.log("----- Target FRONTMATTER");
    console.log(template_content.frontmatter);
    console.log("----- Target FRONTMATTER ATTRIBUTES");
    console.log(template_content.frontmatter_attributes);
    console.log("###########################");

    // attribut-quelle -> attribut-ziel - platt ersetzen, oder
    const mapper = {
      "title":"title",
      "":""
    }

    // Ich muss eigentlich im target frontmatter nach den Platzhalten gucken, und die ersetzen...
    // oder... das geht wenn die propertynames == platzhalter sind: obj[name] -> {name}
    // das ersetzen erfolgt aus den attributen der quelle...
    //  was ist mit den Feldern aus dem Splitter? -> MD_Transformer_TemplateValues_Type aus md-transformer.

    // TODO Mapping and replacing
    // const mdfm: MD_Frontmatter_Mapper = new MD_Frontmatter_Mapper("","");

    return file_content;
  }
}
