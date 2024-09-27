import { MD_Transporter_Parameter_Type } from "../transporter/md-transporter";
import { MD_FileContent_Interface, MD_Filesystem } from "../md-filesystem";
import { MD_Observer_Interface } from "../md-observer";
import { MD_Transformer_AbstractBase } from "../md-transformer";
import {
  MD_Frontmatter_Parameter_Type,
  MD_Frontmatter_Template,
} from "../md-frontmatter";
import { MD_Mapper } from "../md-mapping";

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
    if (
      parameter.frontmatter_filename.length > 0 &&
      MD_Filesystem.is_file_exist(parameter.frontmatter_filename)
    ) {
      console.log(`before: ${parameter.frontmatter}`);
      const frontmatter: MD_Frontmatter_Template = new MD_Frontmatter_Template(
        ""
      );
      frontmatter.load(parameter.frontmatter_filename);
      parameter.frontmatter = frontmatter;
      console.log(`after: ${parameter.frontmatter}`);
    } else {
      console.log(`file not found: ${parameter.frontmatter_filename}`);
      console.log(parameter.frontmatter);
    }
  }

  public add_observer(observer: MD_Observer_Interface) {
    this.observer_subject.add_observer(observer);
  }

  /**
   *
   *
   * @param {MD_Transporter_Parameter_Type} job_paramter
   * @memberof MD_Frontmatter_Transformer
   */
  public set_job_parameter(job_paramter: MD_Transporter_Parameter_Type): void {
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
  public transform(
    file_content: MD_FileContent_Interface,
    index: number
  ): MD_FileContent_Interface {
    // Is only executed the first time, and not for every line.
    if (index === 0) {
      // The one is like this:
      // file_content: MD_FileContent_Interface
      file_content.frontmatter;
      file_content.frontmatter_attributes;

      // The other like this:
      // this.frontmatter_target: MD_Frontmatter_Template
      const template_content: MD_FileContent_Interface =
        MD_Filesystem.split_frontmatter_body(
          this.parameter.frontmatter.get_template_string()
        );

      template_content.frontmatter;
      template_content.frontmatter_attributes;

      console.log(
        "Frontmatter-Source:",
        file_content.frontmatter_attributes,
        ", Frontmatter-Target:",
        template_content.frontmatter_attributes
      );

      //* 2. Replace placeholder
      //* 2a. Is a property in Target > copy content over
      var fm_old = file_content.frontmatter_attributes;
      var fm_new = template_content.frontmatter_attributes;

      for (let prop in fm_old) {
        // Is property in Target > copy content over.
        if (fm_new.hasOwnProperty(prop)) {
          fm_new[prop] = fm_old[prop];
        }
      }

      //* 2b. Map via Mapper
      // Ich muss eigentlich im target frontmatter nach den Platzhalten gucken, und die ersetzen...
      // oder... das geht wenn die propertynames == platzhalter sind: obj[name] -> {name}
      // das ersetzen erfolgt aus den attributen der quelle...
      // Was ist mit den Feldern aus dem Splitter? -> MD_Transformer_TemplateValues_Type aus md-transformer.
      const mapper:MD_Mapper = new MD_Mapper();
      mapper.addMappings(this.parameter.mappings);
      mapper.do_mappings(file_content.frontmatter_attributes, fm_new);
  
      // github.com/erikvullings/deep-copy-ts
      file_content.frontmatter_attributes = { ...fm_new }; // clone

    } // if index===0

    return file_content;
  }
}
