import { MD_CopyJob } from "../md-copy-job";
import { MD_CopyTask_Type } from "../md-transformer";
import { MD_Exporter_Parameter_Type } from "../md-exporter";
import { MD_Template } from "../md-template";
import {
  MD_Transformer_AbstractBase,
  MD_Transformer_Interface,
  MD_Transformer_Parameter_Type,
} from "../md-transformer";
import { MD_Observer_Interface } from "../md-observer";
import { MD_FileContent_Interface } from "../md-filesystem";

// TODO D_ObsidianLink_TemplateValues_Type
export interface MD_LinkTransformer_TemplateValues_Type {
  name_full: string;
  name: string;
  name_suffix: string;
}

/**
 ** Replace in Obsidian Wikilink, oder Markdownlink with Hugo Shortcode.
 *  Baseclass.
 *
 * - from: ![[my-file.suffix]]
 * - to: ...depends on usecase
 *
 * @class MD_ObsidianLink_Transformer_Base
 * @implements {MD_Transformer_Interface}
 */
export class MD_ObsidianLink_Transformer_Base extends MD_Transformer_AbstractBase {
  protected tag_obsidian_prefix: string = "";
  protected tag_obsidian_suffix: string = "";
  protected find_rule = "";

  protected replace_template: string = "";

  protected tag: string = "";

  protected copy_task?: MD_CopyTask_Type;

  // TODO: MD_LinkTransformer_TemplateValues_Type
  protected template_values: MD_LinkTransformer_TemplateValues_Type = {
    name_suffix: "",
    name: "",
    name_full: "",
  };

  /**
   * Creates an instance of MD_ObsidianLink_Transformer_Base.
   * @param {MD_Transformer_Parameter_Type} parameter
   * @memberof MD_ObsidianLink_Transformer_Base
   */
  constructor(parameter: MD_Transformer_Parameter_Type) {
    super();
    this.tag_obsidian_prefix = parameter.tag_obsidian_prefix;
    this.tag_obsidian_suffix = parameter.tag_obsidian_suffix;
    this.replace_template = parameter.replace_template;
    this.find_rule = parameter.find_rule;

    this.copy_task = parameter.copy_task;
  }

  private reset() {
    this.tag = "";
    this.template_values.name_full = "";
    this.template_values.name = "";
    this.template_values.name_suffix = "";
  }

  public set_job_parameter(job_paramter: MD_Exporter_Parameter_Type): void {
    super.set_job_parameter(job_paramter);

    // parent job-property overwrites copy_task property
    // TODO simulate_job overwrites the simulate_copy_job property, if:
    // job   copy   -> result in copy_job simulation
    // false false     false
    // false true      true
    // true  false     true
    // true  true      true
    // TODO das geht so nicht... da muss ein separater state her...
    // todo + umzug in superklasse
    // this.copy_task.simulate = this.copy_task.simulate && this.job_parameter.simulate;

    // Das ist ein Hack.
    //? Eigentlich ist die Metode ja in der abstrakten Basisklasse vorhanden.
    // Sie wird aber nicht erkannt bei übergabe als Parameter. zB: function(task:MD_Transformer_Interface)
  }

  /**
   * The transform method is called by MD_Exporter.
   *
   * @param {MD_FileContent_Interface} file_content
   * @param {number} index
   * @return {*}  {(string[])}
   * @memberof MD_ObsidianLink_Transformer_Base
   */
  public transform(
    file_content: MD_FileContent_Interface,
    index: number
  ): MD_FileContent_Interface {
    let item = file_content.body_array[index];

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

    return file_content;
  }

  protected toString(what: string): string {
    return `
  Transform ${what}...
  tag         : ${this.tag}
  name_full   : ${this.template_values.name_full}
  name        : ${this.template_values.name}
  name_suffix : ${this.template_values.name_suffix}
  copy_task   : ${MD_CopyJob.toString(this)}`;
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
 *
 * @export
 * @class MD_ObsidianLink_Transformer
 * @extends {MD_ObsidianLink_Transformer_Base}
 */
export class MD_ObsidianLink_Transformer extends MD_ObsidianLink_Transformer_Base {
  public add_observer(observer: MD_Observer_Interface) {
    this.observer_subject.add_observer(observer);
  }

  /**
   * The transform method is called by MD_Exporter.
   * @param {string[]} source
   * @param {number} index
   * @return {*}  (Array<string>)
   * @memberof MD_ObsidianLink_Transformer
   */
  public transform(
    file_content: MD_FileContent_Interface,
    index: number
  ): MD_FileContent_Interface {
    super.transform(file_content, index);

    if (this.template_values.name_suffix.match(`^(${this.find_rule})$`)) {
      // match(/^(pdf|ods|odp)$/)  oder match('^(pdf|ods|odp)$')
      console.log(this.toString(`find rule '${this.find_rule}'`));
      console.log(`item before : ${file_content.body_array[index]}`);

      const hugo_template: MD_Template = new MD_Template(this.replace_template);

      file_content.body_array[index] = file_content.body_array[index].replace(
        this.tag,
        hugo_template.fill(this.template_values)
      );

      console.log(`item after  : ${file_content.body_array[index]}`);
      console.log(``);

      // parent job-property overwrites copy_task property
      // TODO simulate_job overwrites the simulate_copy_job property, if:
      // job   copy   -> result in copy_job simulation
      // false false     false
      // false true      true
      // true  false     true
      // true  true      true
      if (MD_CopyJob.hasCopyTask(this)) {
        this.copy_task.simulate =
          this.copy_task.simulate && this.job_parameter.simulate;
        MD_CopyJob.perform(this.copy_task, this.template_values);
      }
    }

    return file_content;
  }
}
