import { Mapper_Properties, Mapper_Task_Interface } from "../../mapper";
export class BooleanInverse_Mapping
  implements Mapper_Task_Interface
{
  perform(mapping_properties: Mapper_Properties): boolean {
    return !mapping_properties.source_value;
  }

}