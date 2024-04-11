import { MD_MappingTask, MD_MappingTask_Properties } from "../md-mapping";

export class MD_BooleanInverse_Mapping
  implements MD_MappingTask
{
  perform(mapping_properties: MD_MappingTask_Properties): boolean {
    return !mapping_properties.source_value;
  }

}