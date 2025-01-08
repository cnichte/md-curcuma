import {
  Task_Interface,
  IO_Meta_Interface,
} from "../../types";

import { MD_Filesystem } from "../../../md-filesystem";
import { MD_MathTransformer_TemplateValues_Type } from "./MD_Math_Paragraph_Task";
import { MD_FileContent, MD_FileContent_Interface } from "./helpers/markdown-filecontent";
import { MD_Observable_Abstract_TaskBase } from "./MD_Observable_Abstract_TaskBase";


export interface MD_FrontmatterTask_Parameter_Type {
  frontmatter_filename: string;
  frontmatter: any;
}

//TODO: Das was früher ein MD_Transporter
export class MD_Frontmatter_Task<T extends string> extends MD_Observable_Abstract_TaskBase<T> implements Task_Interface<T>
{
  parameter: MD_FrontmatterTask_Parameter_Type;
  collection: string[] | null | undefined = null;
  counter: number = 0;

  doCollect: boolean = false;

  protected template_values: MD_MathTransformer_TemplateValues_Type = {
    content: "",
  };

  constructor(parameter: MD_FrontmatterTask_Parameter_Type) {
    super();
    this.parameter = parameter;
  }

  public perform(dao: T, io_meta: IO_Meta_Interface): T {
    dao = super.perform(dao, io_meta);
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
