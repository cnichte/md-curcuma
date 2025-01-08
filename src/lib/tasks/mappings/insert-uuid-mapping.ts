import { Mapping_Task_Interface, Mapping_Task_Properties } from "../Mapping_Task";

import { v4 as uuidv4, validate as uuidValidate } from "uuid";

export class InsertUUID_Mapping implements Mapping_Task_Interface {
  /**
   *
   * @param {Mapping_Task_Properties} mapping_properties
   * @return {*}  {string}
   * @memberof InsertUUID_Mapping
   */
  perform(mapping_properties: Mapping_Task_Properties): string {
    if (uuidValidate(mapping_properties.source_value)) {
      return mapping_properties.source_value;
    } else {
      return uuidv4();
    }
  }
}
