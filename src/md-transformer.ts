/**
 * A collection of transformers to manipulate the text content.
 *
 * - Shortcode_Transformer_Base
 *  - Image_Transformer
 *  - DownloadButton_Transformer
 * - RemoveTODOS_Transformer
 *
 * @author Carsten Nichte - 2024
 */

import { MD_Template } from "./md-splitter-utils";

export interface MD_Transformer_Parameter {
  tag_obsidian_prefix: string;
  tag_obsidian_suffix: string;
  find_rule: string;
  replace_template: string;
}

export interface MD_Transformer_TemplateValues {
  name_full: string;
  name: string;
  name_suffix: string;
}

/**
 * Describes a Transformer class.
 *
 * @export
 * @interface MD_Transformer
 */
export interface MD_Transformer {
  /**
   * The Transform method is called by the MD_Splitter.
   *
   * @param {Array<string>} source
   * @param {number} index
   * @return {*}  {(string | Array<string> | boolean)}
   * @memberof MD_Transformer
   */
  transform(
    source: Array<string>,
    index: number
  ): string | Array<string> | boolean;
}

/**
 ** Replace in Obsidian format with Hugo dhortcode.
 *  Baseclass.
 *
 * - from: ![[my-file.suffix]]
 * - to: ...depends on usecase
 *
 * @class ObsidianLink_Transformer_Base
 * @implements {MD_Transformer}
 */
export class ObsidianLink_Transformer_Base implements MD_Transformer {
  protected tag_obsidian_prefix: string = "";
  protected tag_obsidian_suffix: string = "";
  protected find_rule = "";

  protected replace_template: string = "";

  protected tag: string = "";

  protected template_values: MD_Transformer_TemplateValues = {
    name_suffix: "",
    name: "",
    name_full: "",
  };

  /**
   * Creates an instance of ObsidianLink_Transformer_Base.
   * @param {MD_Transformer_Parameter} parameter
   * @memberof ObsidianLink_Transformer_Base
   */
  constructor(
    parameter: MD_Transformer_Parameter
  ) {
    this.tag_obsidian_prefix = parameter.tag_obsidian_prefix;
    this.tag_obsidian_suffix = parameter.tag_obsidian_suffix;
    this.replace_template = parameter.replace_template;

    this.find_rule = parameter.find_rule;
  }

  private reset() {
    this.tag = "";
    this.template_values.name_full = "";
    this.template_values.name = "";
    this.template_values.name_suffix = "";
  }


  /**
   * The Transform method is called by the MD_Splitter.
   *
   * @param {string[]} source
   * @param {number} index
   * @return {*}  {(string | boolean | string[])}
   * @memberof ObsidianLink_Transformer_Base
   */
  public transform(source: string[], index: number): string | boolean | string[] {
    let item = source[index];

    this.reset();

    if (item.indexOf(this.tag_obsidian_prefix) >= 0) {
      this.tag = item.substring(
        item.indexOf(this.tag_obsidian_prefix),
        item.lastIndexOf(this.tag_obsidian_suffix) + 2
      );

      this.template_values.name_full = item.substring(
        item.indexOf(this.tag_obsidian_prefix) + 3,
        item.lastIndexOf(this.tag_obsidian_suffix)
      );

      this.template_values.name = this.template_values.name_full.substring(
        0,
        this.template_values.name_full.lastIndexOf(".")
      );

      this.template_values.name_suffix =
        this.template_values.name_full.substring(
          this.template_values.name_full.lastIndexOf(".") + 1,
          this.template_values.name_full.length
        );
    } // "![["

    return true;
  }

  protected toString(what: string): string {
    return `
Transform ${what}...
tag         : ${this.tag}
name_full   : ${this.template_values.name_full}
name        : ${this.template_values.name}
name_suffix : ${this.template_values.name_suffix}`;
  }
}

/**
 ** Replaces Link in Obsidian format with Hugo shortcode.
 *
 * Transforms...
 *
 * - from: ![[my-doc.pdf]]
 * - to:   {{< button href="/getthis.php?id=${this.name}" name="download ${this.name} (${this.name_suffix})" >}}`
 * - from: ![[my-image.jpg]]
 * - to:   {{< lightbox-docs id="0" folder="images/kursbuch-vs/my-image/*" showImageNr=0 >}}
 * @export
 * @class ObsidianLink_Transformer
 * @extends {ObsidianLink_Transformer_Base}
 */
export class ObsidianLink_Transformer extends ObsidianLink_Transformer_Base {
  /**
   * The Transform method is called by the MD_Splitter.
   * @param {string[]} source
   * @param {number} index
   * @return {*}  {(string | boolean | string[])}
   * @memberof ObsidianLink_Transformer
   */
  transform(source: string[], index: number): string | boolean | string[] {
    super.transform(source, index);

    if (this.template_values.name_suffix.match(`^(${this.find_rule})$`)) {
      // match(/^(pdf|ods|odp)$/)  oder match('^(pdf|ods|odp)$')
      console.log(this.toString(`find rule '${this.find_rule}'`));
      console.log(`item before : ${source[index]}`);

      const hugo_template: MD_Template = new MD_Template(this.replace_template);

      source[index] = source[index].replace(
        this.tag,
        hugo_template.fill(this.template_values)
      );

      console.log(`item after  : ${source[index]}`);
      console.log(``);
    }

    return true;
  }
}

/**
 * Removes a paragraph beginning with - [ ] #TODO or a custom find_rule
 *
 * @export
 * @class RemoveTODOS_Transformer
 * @implements {MD_Transformer}
 */
export class RemoveTODOS_Transformer implements MD_Transformer {

  private find_rule = "";

  /**
   * Creates an instance of RemoveTODOS_Transformer.
   * @param {string} [find_rule="- [ ] #TODO "]
   * @memberof RemoveTODOS_Transformer
   */
  constructor(find_rule:string = "- [ ] #TODO "){
    this.find_rule = find_rule;
  }

  /**
   * The Transform method is called by the MD_Splitter.
   * @param source
   * @param index
   */
  transform(source: string[], index: number): string | boolean | string[] {
    if (source[index].indexOf(this.find_rule) >= 0) {
      console.log(`Transform TODO (remove) : ${source[index]}`);
      source.splice(index, 1);
      return true;
    } else {
      return false;
    }
  }
}
