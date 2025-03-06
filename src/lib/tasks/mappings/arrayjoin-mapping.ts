import _ = require("lodash");
import { Mapper_Properties, Mapper_Task_Interface } from "../../core/mapper";

export interface ArrayJoin_MappingType {
  separator: string;
}

export class ArrayJoin_Mapping implements Mapper_Task_Interface {
  protected properties: ArrayJoin_MappingType;
  constructor(properties: ArrayJoin_MappingType) {
    this.properties = properties;
  }
  perform(mapping_properties: Mapper_Properties) {
    let target_value: any = mapping_properties.source_value;
    // array of strings - okay
    // array of objects - not okay

    // https://lodash.com/docs/4.17.15
    // TODO: path zum property angeben via lodash? source_property_name = protocol.details
    // https://lodash.com/docs/4.17.15#has

    if (_.isArray(target_value)) {
      // Array of objects or array of strings
      target_value = target_value
        .map((item) => {
          if (_.isString(item)) {
            return item;
          } else if (_.isObject(item)) {
            return JSON.stringify(item);
          }
        })
        .join(this.properties.separator);
    }
    return target_value;
  }
}
