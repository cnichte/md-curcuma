import {
  Task_Interface,
  IO_Meta_Interface,
} from "../../types";

import { MD_Filesystem } from "../../../md-filesystem";
import { MD_MathTransformer_TemplateValues_Type } from "./MD_Math_Paragraph_Task";
import { MD_FileContent, MD_FileContent_Interface } from "./helpers/markdown-filecontent";


export interface MD_FrontmatterTask_Parameter_Type {
  frontmatter_filename: string;
  frontmatter: any;
}

//TODO: Das was früher ein MD_Transporter
export class MD_Frontmatter_Task<T extends string>
  implements Task_Interface<T>
{
  parameter: MD_FrontmatterTask_Parameter_Type;
  collection: string[] | null | undefined = null;
  counter: number = 0;

  doCollect: boolean = false;

  protected template_values: MD_MathTransformer_TemplateValues_Type = {
    content: "",
  };

  constructor(parameter: MD_FrontmatterTask_Parameter_Type) {
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
    return dao;
  }
}
