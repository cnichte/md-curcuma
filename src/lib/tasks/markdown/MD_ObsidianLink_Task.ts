import {
  IO_Meta_Interface,
} from "../../io/types";

import { Filesystem } from "../../core/filesystem";
import { MD_Template } from "./helpers/MD_Template";


// TODO copy Task ist auch ein separater Task und hier nichrt integriert?
// oder ein Subtask..
import { MD_FileContent, MD_FileContent_Interface } from "./helpers/MD_FileContent";
import { MD_Observable_Abstract_TaskBase } from "./MD_Observable_Abstract_TaskBase";
import { CopyJob, CopyTask_Type } from "../../core/copy-job";
import { MD_Task_Parameter_Type, Task_Interface } from "../types";

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
export class MD_ObsidianLink_Task<T extends string> extends MD_Observable_Abstract_TaskBase<T> implements Task_Interface<T>
{
  //! from baseclass
  protected tag_obsidian_prefix: string = "";
  protected tag_obsidian_suffix: string = "";
  protected find_rule = "";

  protected replace_template: string = "";

  protected tag: string = "";

  protected copy_task?: CopyTask_Type;

  //! from class
  parameter: MD_Task_Parameter_Type;
  collection: string[] | null | undefined = null;
  counter: number = 0;

  doCollect: boolean = false;

  protected template_values: MD_LinkTransformer_TemplateValues_Type = {
    name_suffix: "",
    name: "",
    name_full: "",
  };

  constructor(parameter: MD_Task_Parameter_Type) {
    super();
    this.parameter = parameter;
    this.copy_task = parameter.copy_task;
  }

  public perform(dao: T, io_meta: IO_Meta_Interface): T {
    dao = super.perform(dao, io_meta);
    return dao;
  }

  /**
   * Is called by super.perform()
   * @param dao
   * @param index
   * @returns
   */
  protected transform(dao: MD_FileContent, index: number, io_meta: IO_Meta_Interface): MD_FileContent {
    this.super_transform(dao, index, io_meta);

    if (this.template_values.name_suffix.match(`^(${this.find_rule})$`)) {
      // match(/^(pdf|ods|odp)$/)  oder match('^(pdf|ods|odp)$')
      console.log(this.toString(`find rule '${this.find_rule}'`));
      console.log(`item before : ${dao.body_array[index]}`);

      const hugo_template: MD_Template = new MD_Template(this.replace_template);

      dao.body_array[index] = dao.body_array[index].replace(
        this.tag,
        hugo_template.fill(this.template_values)
      );

      console.log(`item after  : ${dao.body_array[index]}`);
      console.log(``);

      // parent job-property overwrites copy_task property
      // TODO simulate_job overwrites the simulate_copy_job property, if:
      // job   copy   -> result in copy_job simulation
      // false false     false
      // false true      true
      // true  false     true
      // true  true      true
      if (CopyJob.hasCopyTask(this)) {
        // simulate:  this.copy_task.simulate = this.copy_task.simulate && this.job_parameter.simulate;

        CopyJob.perform(this.copy_task, this.template_values);
      }
    }

    return dao;
  }
  super_transform(file_content: any, index: number, io_meta: IO_Meta_Interface) {
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

  private reset() {
    this.tag = "";
    this.template_values.name_full = "";
    this.template_values.name = "";
    this.template_values.name_suffix = "";
  }

  protected toString(what: string): string {
    return `
    Transform ${what}...
    tag         : ${this.tag}
    name_full   : ${this.template_values.name_full}
    name        : ${this.template_values.name}
    name_suffix : ${this.template_values.name_suffix}
    copy_task   : ${CopyJob.toString(this)}`;
  }
}
