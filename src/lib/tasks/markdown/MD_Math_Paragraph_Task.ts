//TODO: Das was früher ein MD_Transporter
//TODO: siehe md-math-task
// TODO: Es gibt einen für Inline and Paragraph

import {
  Data_Interface,
  IO_Meta_Interface,
} from "../../io/types";

import { Filesystem } from "../../core/filesystem";
import { MD_Template } from "./helpers/MD_Template";
import { MD_FileContent, MD_FileContent_Interface } from "./helpers/MD_FileContent";
import { MD_Observable_Abstract_TaskBase } from "./MD_Observable_Abstract_TaskBase";
import { MD_Task_Parameter_Type, Task_Interface } from "../types";

export interface MD_MathTransformer_TemplateValues_Type {
  content: string;
}

//TODO: Das was früher ein MD_Transporter
export class MD_Math_Paragraph_Task<T extends string> extends MD_Observable_Abstract_TaskBase<T> implements Task_Interface<T>
{
  parameter: MD_Task_Parameter_Type;
  collection: string[] | null | undefined = null;
  counter: number = 0;

  doCollect: boolean = false;

  protected template_values: MD_MathTransformer_TemplateValues_Type = {
    content: "",
  };

  constructor(parameter: MD_Task_Parameter_Type) {
    super();
    this.parameter = parameter;
  }

  public perform(dao: Data_Interface<T>): Data_Interface<T> {
    dao = super.perform(dao);
    return dao;
  }

  /**
   * Is called by super.perform()
   * @param mdfc
   * @param index
   * @returns
   */
  protected transform(mdfc: MD_FileContent, index: number): MD_FileContent {
    let item = mdfc.body_array[index];

    // Formel als Absatz mit $$
    if (
      !this.doCollect &&
      item.indexOf(this.parameter.tag_obsidian_prefix) >= 0
    ) {
      // $$
      this.doCollect = true;
      console.log("#### math: found!");
      this.collection = []; // may go over several lines
      mdfc.body_array.splice(index, 1); // Remove line: $$
      mdfc.index = mdfc.index - 1;
      // start to collect
    } else if (this.doCollect) {
      if (item.indexOf(this.parameter.tag_obsidian_suffix) >= 0) {
        // $$
        this.doCollect = false;
        console.log("#### math: process!");
        // end collection, build with template, apply...
        this.template_values.content = this.collection.join("\n");
        const template: MD_Template = new MD_Template(
          this.parameter.replace_template
        );
        mdfc.body_array[index] = template.fill(this.template_values);
      } else {
        this.collection.push(item); // remember and remove
        mdfc.body_array.splice(index, 1);
        mdfc.index = mdfc.index - 1;
        console.log("#### math: collect...", this.collection);
      }
    }
    return mdfc;
  }
}
