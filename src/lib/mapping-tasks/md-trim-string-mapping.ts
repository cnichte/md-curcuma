import { MD_MappingTask, MD_MappingTask_Properties } from "../md-mapping";

export interface MD_TrimString_MappingType {
  char: string;
}

export class MD_TrimString_Mapping implements MD_MappingTask {
  protected properties: MD_TrimString_MappingType;
  constructor(properties: MD_TrimString_MappingType) {
    this.properties = properties;
  }

  perform(mapping_properties: MD_MappingTask_Properties) {
    let str = mapping_properties.source_value;
    let ch = this.properties.char;

    var start = 0, end = str.length;

    while (start < end && str[start] === ch) ++start;
    while (end > start && str[end - 1] === ch) --end;
    return start > 0 || end < str.length ? str.substring(start, end) : str;
  }
}
