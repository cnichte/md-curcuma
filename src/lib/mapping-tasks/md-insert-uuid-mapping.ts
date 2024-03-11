import { MD_MappingTask, MD_MappingTask_Properties } from "../md-mapping";
import { v4 as uuidv4 } from 'uuid';

export class MD_InsertUUID_Mapping implements MD_MappingTask {
  perform(mapping_properties: MD_MappingTask_Properties): string {
    return uuidv4();
  }
}
