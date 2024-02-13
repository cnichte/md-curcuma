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
import { MD_Observer_Interface, MD_ObserverSubject } from "./md-observer";

export interface MD_CopyTask_Type {
  source:string;
  target:string;
  simulate:boolean;
}
export interface MD_Transformer_Parameter_Type {
  tag_obsidian_prefix: string;
  tag_obsidian_suffix: string;
  find_rule: string;
  replace_template: string;
  copy_task?:MD_CopyTask_Type;
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
  addObserver(observer: MD_Observer_Interface):void;
}

export abstract class MD_Transformer_AbstractBase implements MD_Transformer_Interface {
  
  protected job_parameter:MD_Exporter_Parameter_Type;
  protected observer_subject: MD_ObserverSubject = new MD_ObserverSubject(); 
  
  abstract transform(source: Array<string>, index: number):Array<string>;

  public set_job_parameter(job_paramter: MD_Exporter_Parameter_Type): void {
    this.job_parameter = job_paramter;
  }

  public addObserver(observer: MD_Observer_Interface):void {
    this.observer_subject.add_observer(observer);
  }
}