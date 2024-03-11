import { MD_MappingTask, MD_MappingTask_Properties } from "../md-mapping";

export class MD_AdoptValue_Mapping implements MD_MappingTask {
  perform(mapping_properties: MD_MappingTask_Properties) {
    return mapping_properties.target_value;
  }
}
