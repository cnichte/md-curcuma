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

import { MD_Transporter_Parameter_Type } from "./transporter/md-transporter";
import { MD_FileContent_Interface } from "./md-filesystem";
import { MD_Observer_Interface, MD_ObserverSubject } from "./md-observer";

export interface MD_CopyTask_Type {
  source: string;
  target: string;
  simulate: boolean;
}
export interface MD_Transformer_Parameter_Type {
  tag_obsidian_prefix: string;
  tag_obsidian_suffix: string;
  find_rule?: string;
  replace_template: string;
  copy_task?: MD_CopyTask_Type;
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
   * @param {MD_FileContent_Interface} file_content
   * @param {number} index
   * @return {*}  {Array<string>}
   * @memberof MD_Transformer_Interface
   */
  transform(
    file_content: MD_FileContent_Interface, // file_content.body_array --- MD_FileContent_Interface
    index: number
  ): MD_FileContent_Interface;

  set_job_parameter(job_paramter: MD_Transporter_Parameter_Type): void;
  addObserver(observer: MD_Observer_Interface): void;
}

export abstract class MD_Transformer_AbstractBase
  implements MD_Transformer_Interface
{
  protected job_parameter: MD_Transporter_Parameter_Type;
  protected observer_subject: MD_ObserverSubject = new MD_ObserverSubject();

  abstract transform(
    file_content: MD_FileContent_Interface,
    index: number
  ): MD_FileContent_Interface;

  public set_job_parameter(job_paramter: MD_Transporter_Parameter_Type): void {
    this.job_parameter = job_paramter;
  }

  public addObserver(observer: MD_Observer_Interface): void {
    this.observer_subject.add_observer(observer);
  }
}
