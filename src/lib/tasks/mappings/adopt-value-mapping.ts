import { Mapper_Properties, Mapper_Task_Interface } from "../../core/mapper";

export class AdoptValue_Mapping implements Mapper_Task_Interface {

  /**
   * This is a minimalist example.
   * It does nothing more than return the value.
   *
   * @param {Mapping_Properties} mapping_properties
   * @return {*} 
   * @memberof AdoptValue_Mapping
   */
  perform(mapping_properties: Mapper_Properties) {
    return mapping_properties.target_value;
  }
}
