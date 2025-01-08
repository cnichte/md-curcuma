import { MappingTask, MappingTask_Properties } from "../Mapping_Task";

export class BooleanInverse_Mapping
  implements MappingTask
{
  perform(mapping_properties: MappingTask_Properties): boolean {
    return !mapping_properties.source_value;
  }

}