//TODO: Das was früher ein MD_Transporter
//TODO: siehe md-math-task
// TODO: Es gibt einen für Inline and Paragraph

import {
  Task_Interface,
  MD_Task_Parameter_Type,
  IO_Meta_Interface,
} from "../../types";

import { MD_Filesystem } from "../../../md-filesystem";
import { MD_Template } from "../../../md-template";
import { MD_FileContent, MD_FileContent_Interface } from "./helpers/markdown-filecontent";

export interface MD_MathTransformer_TemplateValues_Type {
  content: string;
}

//TODO: Das was früher ein MD_Transporter
export class MD_Math_Paragraph_Task<T extends string>
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

  public perform(dao: T, io_meta: IO_Meta_Interface): T {
    // console.log("#######################################");
    // console.log("before", dao.data);

    // Trenne das Frontmatter vom body ab. siehe md-transporter.
    const mdfc: MD_FileContent_Interface =
      MD_Filesystem.split_frontmatter_body(dao);

    for (var i = 0; i < mdfc.body_array.length; i++) {
      mdfc.index = i;
      const test: MD_FileContent_Interface = this.transform(mdfc, i, io_meta);
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
  protected transform(dao: MD_FileContent, index: number, io_meta: IO_Meta_Interface): MD_FileContent {
    let item = dao.body_array[index];

    // Formel als Absatz mit $$
    if (
      !this.doCollect &&
      item.indexOf(this.parameter.tag_obsidian_prefix) >= 0
    ) {
      // $$
      this.doCollect = true;
      console.log("#### math: found!");
      this.collection = []; // may go over several lines
      dao.body_array.splice(index, 1); // Remove line: $$
      dao.index = dao.index - 1;
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
        dao.body_array[index] = template.fill(this.template_values);
      } else {
        this.collection.push(item); // remember and remove
        dao.body_array.splice(index, 1);
        dao.index = dao.index - 1;
        console.log("#### math: collect...", this.collection);
      }
    }
    return dao;
  }
}
