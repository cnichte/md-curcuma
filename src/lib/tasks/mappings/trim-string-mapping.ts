import { MappingTask, MappingTask_Properties } from "../Mapping_Task";

export interface TrimString_MappingType {
  char: string;
}

export class TrimString_Mapping implements MappingTask {
  protected properties: TrimString_MappingType;
  constructor(properties: TrimString_MappingType) {
    this.properties = properties;
  }

  perform(mapping_properties: MappingTask_Properties) {
    let str = mapping_properties.source_value;
    if (str != null && str != undefined) {
      let ch = this.properties.char;

      var start = 0, end = str.length;

      while (start < end && str[start] === ch) ++start;
      while (end > start && str[end - 1] === ch) --end;
      return start > 0 || end < str.length ? str.substring(start, end) : str;
    } else {
      return str;
    }
  }
}
