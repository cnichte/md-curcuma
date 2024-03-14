import { MD_MappingTask, MD_MappingTask_Properties } from "../md-mapping";

export interface MD_ArraySplit_MappingType {
  separator: string;
}

export class MD_ArraySplit_Mapping implements MD_MappingTask {
  protected properties: MD_ArraySplit_MappingType;
  constructor(properties: MD_ArraySplit_MappingType) {
    this.properties = properties;
  }

  /**
   * if a value contains multiple comma separated data store it in form of array.
   *
   * @param {MD_MappingTask_Properties} mapping_properties
   * @return {*}  {(string[] | string)}
   * @memberof MD_ArraySplit_Mapping
   */
  perform(mapping_properties: MD_MappingTask_Properties):string[] | string {
    let target_value: string = mapping_properties.source_value;
    if (target_value.includes(this.properties.separator)){
      console.log(`Tags split: ${target_value}`);
      return target_value.split(this.properties.separator).map((item) => item.trim());
    }else{
      console.log(`Tags: ${target_value}`);
      return target_value;
    }
  }
}
