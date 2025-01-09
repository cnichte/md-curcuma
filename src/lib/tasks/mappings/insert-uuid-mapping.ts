import { Mapper_Properties, Mapper_Task_Interface } from "../../core/mapper";

import { v4 as uuidv4, validate as uuidValidate } from "uuid";

export class InsertUUID_Mapping implements Mapper_Task_Interface {
  /**
   *
   * @param {Mapping_Properties} mapping_properties
   * @return {*}  {string}
   * @memberof InsertUUID_Mapping
   */
  perform(mapping_properties: Mapper_Properties): string {
    if (uuidValidate(mapping_properties.source_value)) {
      return mapping_properties.source_value;
    } else {
      return uuidv4();
    }
  }
}
