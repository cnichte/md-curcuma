import { MappingTask, MappingTask_Properties } from "../Mapping_Task";

export class AdoptValue_Mapping implements MappingTask {

  /**
   * This is a minimalist example.
   * It does nothing more than return the value.
   *
   * @param {MappingTask_Properties} mapping_properties
   * @return {*} 
   * @memberof AdoptValue_Mapping
   */
  perform(mapping_properties: MappingTask_Properties) {
    return mapping_properties.target_value;
  }
}
