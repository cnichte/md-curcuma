import { MD_MappingTask, MD_MappingTask_Properties } from "../md-mapping";

export interface MD_ArrayJoin_MappingType {
  separator: string;
}

export class MD_ArrayJoin_Mapping implements MD_MappingTask {
  protected properties: MD_ArrayJoin_MappingType;
  constructor(properties: MD_ArrayJoin_MappingType) {
    this.properties = properties;
  }
  perform(mapping_properties: MD_MappingTask_Properties) {
    let target_value: any = mapping_properties.source_value;
    if (Array.isArray(target_value)) {
      target_value = target_value.join(this.properties.separator);
    }

    return target_value;
  }
}
