import { Mapping_Task, Mapping_Task_Properties } from "../Mapping_Task";

export class BooleanInverse_Mapping
  implements Mapping_Task
{
  perform(mapping_properties: Mapping_Task_Properties): boolean {
    return !mapping_properties.source_value;
  }

}