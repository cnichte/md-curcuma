import { MD_MappingTask, MD_MappingTask_Properties } from "../md-mapping";
import { v4 as uuidv4, validate as uuidValidate } from "uuid";

export class MD_InsertUUID_Mapping implements MD_MappingTask {
  /**
   *
   * @param {MD_MappingTask_Properties} mapping_properties
   * @return {*}  {string}
   * @memberof MD_InsertUUID_Mapping
   */
  perform(mapping_properties: MD_MappingTask_Properties): string {
    if (uuidValidate(mapping_properties.source_value)) {
      return mapping_properties.source_value;
    } else {
      return uuidv4();
    }
  }
}
