import { MD_MappingTask, MD_MappingTask_Properties } from "../md-mapping";

export class MD_InsertUUID_Mapping implements MD_MappingTask {
  perform(mapping_properties: MD_MappingTask_Properties): string {
    return new Date().toJSON().slice(0, 16);
  }
}
