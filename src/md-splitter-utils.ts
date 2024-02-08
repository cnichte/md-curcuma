
/**
 * 
 * @export
 * @class MD_Template
 */
export class MD_Template {

  template = "";

  /**
   * Creates an instance of MD_Template.
   * 
   * @param {string} template
   * @memberof MD_Template
   */
  constructor(template: string) {
    this.template = template;
  }

  /**
   * Fills the template from the value Objekt, and returns it.
   * 
   * values = { key1:"Hello"}
   * template = `MD_Template says: {key1} oder ${key1} folks!`
   * return `MD_Template says: Hello folks!`
   * @param {*} values
   * @return {*}  {string}
   * @memberof MD_Template
   */
  fill(values: any): string {
    return this.template.replace(/\{(\w+)\}/g, function(_,key:string){
        return values[key];
  });
  }
}