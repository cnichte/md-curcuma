import { Mapping_Task_Interface, Mapping_Task_Properties } from "../Mapping_Task";

export class InsertDate_Mapping implements Mapping_Task_Interface {
  perform(mapping_properties: Mapping_Task_Properties): string {
    return new Date().toJSON().slice(0, 16);
  }
}
