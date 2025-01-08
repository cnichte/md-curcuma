import { Filesystem } from "../../filesystem";
import { IO_Meta_Interface, MD_Task_Parameter_Type, Task_Interface } from "../../types";
import { MD_FileContent, MD_FileContent_Interface } from "./helpers/markdown-filecontent";
import { MD_Observable_Abstract_TaskBase } from "./MD_Observable_Abstract_TaskBase";
import { MD_MathTransformer_TemplateValues_Type } from "./MD_Math_Paragraph_Task";

//TODO: Das was früher ein MD_Transporter
export class MD_RemoveTODOS_Task<T extends string> extends MD_Observable_Abstract_TaskBase<T> implements Task_Interface<T>
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
    if (dao.body_array[index].indexOf(this.parameter.find_rule) >= 0) {
      console.log(
        `Transform TODO (remove) before: ${dao.body_array[index]}`
      );
      dao.body_array.splice(index, 1);
      dao.index = dao.index - 1;
      console.log(
        `Transform TODO (remove) after: ${dao.body_array[index]}`
      );
    }

    return dao;
  }
}
