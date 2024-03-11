export interface MD_MappingTask_Properties {
  source: any;
  target: any;

  source_property_name: string;
  target_poperty_name: string;
  
  source_value:any;
  target_value:any;
}

export interface MD_MappingTask {
  // perform(source_value: any, target_value: any): any;
  perform(mapping_properties:MD_MappingTask_Properties): any;
}

export interface MD_Mapping {
  source_property_name: any;
  target_poperty_name: any;
  task: MD_MappingTask;
}

export class MD_Mapper {
  protected mappings: MD_Mapping[];

  public addMapping(mapping: MD_Mapping): void {
    this.mappings.push(mapping);
  }
  public addMappings(mappings: MD_Mapping[]): void {
    this.mappings = mappings;
  }

  /**
   * Mostly, we either map to another object or to another property in the same object (in which case we set source=target).
   *
   * @param {*} source
   * @param {*} target
   * @memberof MD_Mapper
   */
  public do_mappings(source: any, target: any): void {
    if (this.mappings != null || this.mappings != undefined) {
      if (
        (source != null || source != undefined) &&
        (target != null || target != undefined)
      ) {
        this.mappings.forEach((map: MD_Mapping) => {

          let props:MD_MappingTask_Properties = {
            source: source,
            target: target,

            source_property_name: map.source_property_name,
            target_poperty_name: map.target_poperty_name,
            
            source_value: source[map.source_property_name],
            target_value: target[map.target_poperty_name]
          }

          if (map.task !== undefined || map.task !== null) {
            target[map.target_poperty_name] = map.task.perform(props);
          } else {
            target[map.target_poperty_name] = props.source_value;
          }
        });
      }
    }
  }
}


/*

  public do_mappings(source: any, target: any): void {
    if (this.mappings != null || this.mappings != undefined) {
      if (
        (source != null || source != undefined) &&
        (target != null || target != undefined)
      ) {
        this.mappings.forEach((map: MD_Mapping) => {
          const source_value = source[map.source_property_name];
          const target_value = target[map.target_poperty_name];

          if (map.task !== undefined || map.task !== null) {
            target[map.target_poperty_name] = map.task.perform(source_value, target_value);
          } else {
            target[map.target_poperty_name] = source_value;
          }
        });
      }
    }
  }


*/