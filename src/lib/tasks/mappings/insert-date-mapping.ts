import { Mapper_Properties, Mapper_Task_Interface } from "../../core/mapper";

export class InsertDate_Mapping implements Mapper_Task_Interface {
  perform(mapping_properties: Mapper_Properties): string {
    return new Date().toJSON().slice(0, 16);
  }
}
