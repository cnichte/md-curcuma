import { MD_MappingTask, MD_MappingTask_Properties } from "../md-mapping";

export class MD_AdoptValue_Mapping implements MD_MappingTask {

  /**
   * This is a minimalist example.
   * It does nothing more than return the value.
   *
   * @param {MD_MappingTask_Properties} mapping_properties
   * @return {*} 
   * @memberof MD_AdoptValue_Mapping
   */
  perform(mapping_properties: MD_MappingTask_Properties) {
    return mapping_properties.target_value;
  }
}
