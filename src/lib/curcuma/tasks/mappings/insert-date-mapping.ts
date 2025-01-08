import { MappingTask, MappingTask_Properties } from "../Mapping_Task";

export class InsertDate_Mapping implements MappingTask {
  perform(mapping_properties: MappingTask_Properties): string {
    return new Date().toJSON().slice(0, 16);
  }
}
