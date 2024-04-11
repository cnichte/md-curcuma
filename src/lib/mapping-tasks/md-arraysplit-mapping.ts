import { MD_MappingTask, MD_MappingTask_Properties } from "../md-mapping";

export interface MD_ArraySplit_MappingType {
  separator: string;
}

export class MD_ArraySplit_Mapping implements MD_MappingTask {
  protected properties: MD_ArraySplit_MappingType;

  /**
   * 
   */
  constructor(properties: MD_ArraySplit_MappingType) {
    this.properties = properties;
  }

  /**
   * Transforms the data in an array.
   * 
   * @param {MD_MappingTask_Properties} mapping_properties
   * @return {*}  {(string[] | string)}
   * @memberof MD_ArraySplit_Mapping
   */
  perform(mapping_properties: MD_MappingTask_Properties):string[] {
    let target_value: string = mapping_properties.source_value;
    
    if (target_value != null && target_value != undefined) {
      if (target_value.includes(",")) {
        console.log("Tags split: ".concat(target_value));
        return target_value.split(",").map(function (item) { return item.trim(); });
      }
      else {
        return [target_value];
      }
    } else {
      return [target_value];
    }
  }
}
