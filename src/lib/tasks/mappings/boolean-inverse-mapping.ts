import { Mapping_Task_Interface, Mapping_Task_Properties } from "../Mapping_Task";

export class BooleanInverse_Mapping
  implements Mapping_Task_Interface
{
  perform(mapping_properties: Mapping_Task_Properties): boolean {
    return !mapping_properties.source_value;
  }

}