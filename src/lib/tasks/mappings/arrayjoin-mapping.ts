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
    if (Array.isArray(target_value)) {
      target_value = target_value.join(this.properties.separator);
    }

    return target_value;
  }
}
