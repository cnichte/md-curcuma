import * as _ from "lodash";

/**
 * Access nested Properties with "parent_prop.nested_prop".
 * 
 * You can build this typesave from scratch:
 * https://dev.to/pffigueiredo/typescript-utility-keyof-nested-object-2pa3
 * https://stackoverflow.com/questions/6491463/accessing-nested-javascript-objects-and-arrays-by-string-path
 * 
 * or try lodash. This is a wrapper arround some lodash functionallity.
 */
export class Lodash_Wrapper {
  /**
   * https://lodash.com/docs#get
   * @param object
   * @param path
   * @returns
   */
  public static get<ObjectType>(
    object: any,
    path: string
  ): any {
    return _.get(object, path);
  }

  /**
   *
   * @param object
   * @param path
   * @returns
   */
  public static hasIn<ObjectType>(object: any, path: string): boolean {
    return _.hasIn(object, path);
  }

  /**
   * https://lodash.com/docs#set
   * @param object
   * @param path
   * @returns
   */
  public static set<ObjectType>(object: any, path: string, value: any): void {
    _.set(object, path, value);
  }
}
