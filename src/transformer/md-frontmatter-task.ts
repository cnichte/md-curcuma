import { MD_Exporter_Parameter_Type } from "src/md-exporter";
import { MD_Filesystem } from "src/md-filesystem";
import { MD_Frontmatter_Template } from "src/md-frontmatter";
import { MD_Observer_Interface } from "src/md-observer";
import {
  MD_Transformer_AbstractBase,
} from "src/md-transformer";

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

  frontmatter: MD_Frontmatter_Template;

  /**
   * Creates an instance of MD_Frontmatter_Transformer.
   * @param {MD_Frontmatter_Parameter_Type} parameter
   * @memberof MD_Frontmatter_Transformer
   */
  constructor(parameter: MD_Frontmatter_Parameter_Type) {
    super();
    this.parameter = parameter;

    const frontmatter: MD_Frontmatter_Template = new MD_Frontmatter_Template("");
    if(MD_Filesystem.is_file_exist(parameter.frontmatter_filename)) {
      frontmatter.load(parameter.frontmatter_filename);
      this.frontmatter = frontmatter;
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
   * @param {Array<string>} source
   * @param {number} index
   * @return {*}  {Array<string>}
   * @memberof MD_Frontmatter_Transformer
   */
  public transform(source: Array<string>, index: number): Array<string> {
    if (index === 0) {
      // TODO instert Frontmatter / mapping
    }
    return source;
  }
}
