import { MD_MappingTask } from "../md-mapping";

export class MD_Mapping_Copy_Task implements MD_MappingTask {
  perform(source_value: string, target_value: string): string {
    target_value = source_value;
    return target_value;
  }
}
