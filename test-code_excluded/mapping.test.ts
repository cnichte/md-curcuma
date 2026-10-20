import { Mapper_Interface, Mapper_Item_Interface, Mapper_Properties } from "../src/lib/core/mapper";

const map_test: Mapper_Interface<Mapper_Item_Interface> = {
    mapping_items: [
      {
        source_property_name: "Tags",
        target_poperty_name: "Tags",
      }
    ],
    task: {
      perform: function (mapping_properties: Mapper_Properties): string[] {
        // you have access to the source Object, and the Target Object.
        // possibly source and target are the same.
        let the_souce: any = mapping_properties.source;
        let the_target: any = mapping_properties.target;
  
        // The name of the Properties:
        let spn: string = mapping_properties.source_property_name;
        let tpn: string = mapping_properties.target_poperty_name;
  
        // The values are also made available to you,
        // so that you no longer have to read them from the properties:
        let sv: boolean = mapping_properties.source_value; // type any
        let tv: boolean = mapping_properties.target_value; // type any
  
        let target_value: string = mapping_properties.source_value;
        if (target_value != null && target_value != undefined) {
          console.log(`################ ${target_value}`);
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
      },
    }
  };