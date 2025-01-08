import { Mapping_Task_Interface, Mapping_Task_Properties } from "../Mapping_Task";

export class AdoptValue_Mapping implements Mapping_Task_Interface {

  /**
   * This is a minimalist example.
   * It does nothing more than return the value.
   *
   * @param {Mapping_Task_Properties} mapping_properties
   * @return {*} 
   * @memberof AdoptValue_Mapping
   */
  perform(mapping_properties: Mapping_Task_Properties) {
    return mapping_properties.target_value;
  }
}
