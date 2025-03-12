import { omit } from "lodash";

export class Utils {
  /**
   * Remove Properties from Object. 
   * @param d
   * @param excludes
   */
  public static remove_property_from_object(
    d: any,
    excludes: Array<string>
  ): any {

    let filtered_data: any = d;

    for (const exclude_column of excludes) {
      if (filtered_data.hasOwnProperty(exclude_column)) {
        // GUIDE https://stackabuse.com/bytes/typescript-remove-a-property-from-an-object/
        filtered_data = omit(filtered_data as Object, exclude_column);
      }
    }

    return filtered_data;
  }
}
