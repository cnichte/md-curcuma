export interface MD_MappingTask {
  perform(source_value: any, target_value: any): any;
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
}
