//TODO: Das was früher ein MD_Transporter
//TODO: siehe md-math-task
// TODO: Es gibt einen für Inline and Paragraph

import {
  IO_Meta_Interface,
} from "../../io/types";

import { MD_Template } from "./helpers/MD_Template";
import { MD_MathTransformer_TemplateValues_Type } from "./MD_Math_Paragraph_Task";
import { MD_FileContent } from "./helpers/MD_FileContent";
import { MD_Observable_Abstract_TaskBase } from "./MD_Observable_Abstract_TaskBase";
import { MD_Task_Parameter_Type, Task_Interface } from "../types";

//TODO: Das was früher ein MD_Transporter
export class MD_Math_Inline_Task<T extends string> extends MD_Observable_Abstract_TaskBase<T> implements Task_Interface<T>
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
    let paragraph = dao.body_array[index];

    let words_array = paragraph.split(" ");

    for (let i = 0; i < words_array.length; i++) {
      let word = words_array[i].trim();
      // TODO ends with: . , ; etc,
      // todo: use regex
      if (
        word.startsWith(this.parameter.tag_obsidian_prefix) &&
        word.endsWith(this.parameter.tag_obsidian_suffix)
      ) {
        this.template_values.content = word.substring(
          this.parameter.tag_obsidian_prefix.length,
          word.length - this.parameter.tag_obsidian_suffix.length
        );

        console.log("found inline formula!", this.template_values.content);
        const template: MD_Template = new MD_Template(
          this.parameter.replace_template
        );

        words_array[i] = template.fill(this.template_values);
      }
    }

    dao.body_array[index] = words_array.join(" ");

    return dao;
  }
}
