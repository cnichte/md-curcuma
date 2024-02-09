/**
 * A collection of transformers to manipulate the text content.
 * 
 * Transformer sind tasks, die auf Inhalte angewendet werden können.
 *
 * - Shortcode_Transformer_Base
 *  - Image_Transformer
 *  - DownloadButton_Transformer
 * - MD_RemoveTODOS_Transformer
 *
 * @author Carsten Nichte - 2024
 */

import { MD_Exporter_Parameter_Type } from "./md-exporter";

export interface MD_Transformer_Parameter_Type {
  tag_obsidian_prefix: string;
  tag_obsidian_suffix: string;
  find_rule: string;
  replace_template: string;
}

export interface MD_Transformer_TemplateValues_Type {
  name_full: string;
  name: string;
  name_suffix: string;
}


/**
 * Describes a Transformer class.
 *
 * @export
 * @interface MD_Transformer_Interface
 */
export interface MD_Transformer_Interface {

  /**
   * The transform method is called by MD_Exporter.
   *
   * @param {Array<string>} source
   * @param {number} index
   * @return {*}  {Array<string>}
   * @memberof MD_Transformer_Interface
   */
  transform(
    source: Array<string>,
    index: number
  ): Array<string>;

  set_job_parameter(job_paramter:MD_Exporter_Parameter_Type):void;
}

export abstract class MD_Transformer_AbstractBase implements MD_Transformer_Interface {
  
  protected job_parameter:MD_Exporter_Parameter_Type;

  abstract transform(source: Array<string>, index: number):Array<string>;

  public set_job_parameter(job_paramter: MD_Exporter_Parameter_Type): void {
    this.job_parameter = job_paramter;
  }
}