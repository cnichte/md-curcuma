import { MD_Exporter_Parameter_Type } from "src/md-exporter";
import { MD_Frontmatter } from "src/md-frontmatter";
import { MD_Transformer_AbstractBase, MD_Transformer_Interface } from "src/md-transformer";

export interface MD_Frontmatter_Parameter_Type {
  frontmatter_filename: string;
  frontmatter: MD_Frontmatter;
}

export class MD_Frontmatter_Transformer extends MD_Transformer_AbstractBase {
  
  parameter: MD_Frontmatter_Parameter_Type;

  frontmatter: MD_Frontmatter;

  constructor(parameter: MD_Frontmatter_Parameter_Type) {
    super();
    this.parameter = parameter;

    const frontmatter: MD_Frontmatter = new MD_Frontmatter("");
    frontmatter.load(parameter.frontmatter_filename);
    this.frontmatter = frontmatter;
  }

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
  transform(source: Array<string>, index: number): Array<string> {
    if (index === 0) {
      // TODO instert Frontmatter
    }
    return source;
  }
}
