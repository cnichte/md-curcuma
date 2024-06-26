import * as fs from "fs";

/**
 * Holds a Template in form of a string with placeholders {placeholder}.
 * Can load a Template from filesystem.
 * Can fill the template from a object with { placeholder:value,... }
 * 
 * @export
 * @class MD_Template
 */
export class MD_Template {

    protected template:string = "";
  
    /**
     * Creates an instance of MD_Template.
     * 
     * @param {string} template
     * @memberof MD_Template
     */
    constructor(template: string) {
      this.template = template;
    }
  
    load(path:string): void{
      try {
        this.template = fs.readFileSync(path).toString();
      } catch (err) {
        throw err;
      }
    }
  
    /**
     * Fills the template from the value Objekt, and returns it.
     * 
     * values = { key1:"Hello" }
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

    get_template_string(): string{
      return this.template;
    }
  }