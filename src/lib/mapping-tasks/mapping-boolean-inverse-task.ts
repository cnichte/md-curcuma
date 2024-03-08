import { MD_MappingTask } from "../md-mapping";

export class MD_Mapping_BooleanInverse_Task
  implements MD_MappingTask
{
  perform(source_value: boolean, target_value: boolean): boolean {
    target_value = !source_value;
    return target_value;
  }
}
