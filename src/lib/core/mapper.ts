export interface Mapper_Properties {
  source: any;
  target: any;

  source_property_name: string;
  target_poperty_name: string;

  source_value: any;
  target_value: any;
}

export interface Mapper_Task_Interface {
  // perform(source_value: any, target_value: any): any;
  perform(mapping_properties: Mapper_Properties): any;
}

export interface Mapper_Item_Interface {
  source_property_name: any;
  target_poperty_name: any;
}

export interface Mapper_Interface<MI> {
  mapping_items: MI[];
  task?: Mapper_Task_Interface; // TODO could be optional?
}


export class Mapper<MI extends Mapper_Item_Interface> {
  protected mappings: Mapper_Interface<MI>[] = [];

  public addMapping(mapping: Mapper_Interface<MI>): void {
    this.mappings.push(mapping);
  }
  public addMappings(mappings: Mapper_Interface<MI>[]): void {
    this.mappings = mappings;
  }

  /**
   * Mostly, we either map to another object or to another property in the same object (in which case we set source=target).
   * TODO Support nested Properties like in xlsx-transporter.
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
        this.mappings.forEach((map: Mapper_Interface<MI>) => {
          // Alle Felder im Mapping verarbeiten
          map.mapping_items.forEach((mapping_item: MI) => {
            this.do_mapping(mapping_item, source, target, map.task);
          });
        });
      }
    }
  }

  /**
   * Do a single mapping. 
   * Take a look at xlsx-transporter for an example.
   * 
   * @param mapping_item 
   * @param source 
   * @param target 
   * @param task 
   */
  public do_mapping(
    mapping_item: MI,
    source: any,
    target: any,
    task: Mapper_Task_Interface
  ): void {
    let props: Mapper_Properties = {
      source: source,
      target: target,

      source_property_name: mapping_item.source_property_name,
      target_poperty_name: mapping_item.target_poperty_name,

      source_value: source[mapping_item.source_property_name],
      target_value: target[mapping_item.target_poperty_name],
    };

    if (task != null) {
      target[mapping_item.target_poperty_name] = task.perform(props);
    } else {
      target[mapping_item.target_poperty_name] = props.source_value;
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