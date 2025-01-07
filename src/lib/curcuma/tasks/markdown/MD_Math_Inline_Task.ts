//TODO: Das was früher ein MD_Transporter
//TODO: siehe md-math-task
// TODO: Es gibt einen für Inline and Paragraph

import {
  Task_Interface,
  MD_FileContent_Interface,
  MD_Task_Parameter_Type,
  DAO_META_Interface,
} from "../../types";

import { MD_Filesystem } from "../../../md-filesystem";
import { MD_Template } from "../../../md-template";
import { MD_FileContent } from "./MD_Callout_Task";
import { MD_MathTransformer_TemplateValues_Type } from "./MD_Math_Paragraph_Task";

//TODO: Das was früher ein MD_Transporter
export class MD_Math_Inline_Task<T extends string>
  implements Task_Interface<T>
{
  parameter: MD_Task_Parameter_Type;
  collection: string[] | null | undefined = null;
  counter: number = 0;

  doCollect: boolean = false;

  protected template_values: MD_MathTransformer_TemplateValues_Type = {
    content: "",
  };

  constructor(parameter: MD_Task_Parameter_Type) {
    this.parameter = parameter;
  }

  public perform(dao: T, dao_meta: DAO_META_Interface): T {
    // console.log("#######################################");
    // console.log("before", dao.data);

    // Trenne das Frontmatter vom body ab. siehe md-transporter.
    const mdfc: MD_FileContent_Interface =
      MD_Filesystem.split_frontmatter_body(dao);

    for (var i = 0; i < mdfc.body_array.length; i++) {
      mdfc.index = i;
      const test: MD_FileContent_Interface = this.transform(mdfc, i);
      if (test.index != i) i = test.index; // elements are added or removed
    }

    // führe alles wieder zusammen
    dao = MD_Filesystem.merge_frontmatter_body(mdfc) as T;

    // console.log("after", dao.data);
    // console.log("#######################################");

    return dao;
  }

  /**
   *
   * @param dao
   * @param index
   * @returns
   */
  protected transform(dao: MD_FileContent, index: number): MD_FileContent {
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
