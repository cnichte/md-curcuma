import { Mapper_Properties, Mapper_Task_Interface } from "../../core/mapper";

export interface ArraySplit_MappingType {
  separator: string;
}

export class ArraySplit_Mapping implements Mapper_Task_Interface {
  protected properties: ArraySplit_MappingType;

  /**
   * 
   */
  constructor(properties: ArraySplit_MappingType) {
    this.properties = properties;
  }

  /**
   * Transforms the data in an array.
   * 
   * @param {MD_MappingTask_Properties} mapping_properties
   * @return {*}  {(string[] | string)}
   * @memberof MD_ArraySplit_Mapping
   */
  perform(mapping_properties: Mapper_Properties):string[] {
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
