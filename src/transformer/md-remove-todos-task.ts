import { MD_FileContent_Interface } from "../md-filesystem";
import { MD_Exporter_Parameter_Type } from "../md-exporter";
import { MD_Observer_Interface } from "../md-observer";
import {
  MD_Transformer_AbstractBase,
  MD_Transformer_Interface,
  MD_Transformer_Parameter_Type,
} from "../md-transformer";

/**
 * Removes a paragraph beginning with - [ ] #TODO or a custom find_rule
 *
 * @export
 * @class MD_RemoveTODOS_Transformer
 * @implements {MD_Transformer_Interface}
 */
export class MD_RemoveTODOS_Transformer extends MD_Transformer_AbstractBase {
  parameter: MD_Transformer_Parameter_Type;

  /**
   * Creates an instance of MD_RemoveTODOS_Transformer.
   * @param {string} [find_rule="- [ ] #TODO "]
   * @memberof MD_RemoveTODOS_Transformer
   */
  constructor(parameter: MD_Transformer_Parameter_Type) {
    super();
    this.parameter = parameter;
  }

  public add_observer(observer: MD_Observer_Interface) {
    this.observer_subject.add_observer(observer);
  }

  public set_job_parameter(job_paramter: MD_Exporter_Parameter_Type): void {
    super.set_job_parameter(job_paramter);
    // Das ist ein Hack.
    //? Eigentlich ist die Metode ja in der abstrakten Basisklasse vorhanden.
    // Sie wird aber nicht erkannt bei übergabe als Parameter. zB: function(task:MD_Transformer_Interface)
  }

  /**
   * The transform method is called by MD_Exporter.
   *
   * @param {MD_FileContent_Interface} file_content
   * @param {number} index
   * @return {*}  {Array<string>}
   * @memberof MD_RemoveTODOS_Transformer
   */
  public transform(
    file_content: MD_FileContent_Interface,
    index: number
  ): MD_FileContent_Interface {
    if (file_content.body_array[index].indexOf(this.parameter.find_rule) >= 0) {
      console.log(
        `Transform TODO (remove) before: ${file_content.body_array[index]}`
      );
      file_content.body_array.splice(index, 1);
      console.log(
        `Transform TODO (remove) after: ${file_content.body_array[index]}`
      );
    }

    return file_content;
  }
}
