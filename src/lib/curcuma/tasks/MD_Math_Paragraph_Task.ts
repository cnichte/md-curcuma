//TODO: Das was früher ein MD_Transporter
//TODO: siehe md-math-task
// TODO: Es gibt einen für Inline and Paragraph

import { Task_Interface, MD_FileContent_Interface } from "../types";

import { MD_Filesystem } from "../../md-filesystem";
import { MD_Template } from "../../md-template";
import { Markdown_DAO } from "../io";
import { MD_FileContent, MD_Transformer_Parameter_Type } from "./MD_Callout_Task";


export interface MD_MathTransformer_TemplateValues_Type {
  content: string;
}

//TODO: Das was früher ein MD_Transporter
export class MD_Math_Paragrahp_Task<T extends Markdown_DAO<string>>
  implements Task_Interface<T>
{

  parameter: MD_Transformer_Parameter_Type;
  collection: string[] | null | undefined = null;
  counter: number = 0;

  doCollect: boolean = false;

  protected template_values: MD_MathTransformer_TemplateValues_Type = {
    content: "",
  };


  constructor(parameter: MD_Transformer_Parameter_Type) {
    this.parameter = parameter;
  }

  public perform(dao: T): T {
    // console.log("#######################################");
    // console.log("before", dao.data);

    // Trenne das Frontmatter vom body ab. siehe md-transporter.
    const mdfc: MD_FileContent_Interface = MD_Filesystem.split_frontmatter_body(
      dao.data
    );

    for (var i = 0; i < mdfc.body_array.length; i++) {
      mdfc.index = i;
      const test: MD_FileContent_Interface = this.transform(mdfc, i);
      if (test.index != i) i = test.index; // elements are added or removed
    }

    // führe alles wieder zusammen
    dao.data = MD_Filesystem.merge_frontmatter_body(mdfc);

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