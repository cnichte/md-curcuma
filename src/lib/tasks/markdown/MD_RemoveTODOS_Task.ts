import { Filesystem } from "../../core/filesystem";
import { Data_Interface, IO_Meta_Interface } from "../../io/types";
import { MD_FileContent, MD_FileContent_Interface } from "./helpers/MD_FileContent";
import { MD_Observable_Abstract_TaskBase } from "./MD_Observable_Abstract_TaskBase";
import { MD_MathTransformer_TemplateValues_Type } from "./MD_Math_Paragraph_Task";
import { MD_Task_Parameter_Type, Task_Interface } from "../types";

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

  public perform(dao:Data_Interface<T>): Data_Interface<T> {
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
    if (mdfc.body_array[index].indexOf(this.parameter.find_rule) >= 0) {
      console.log(
        `Transform TODO (remove) before: ${mdfc.body_array[index]}`
      );
      mdfc.body_array.splice(index, 1);
      mdfc.index = mdfc.index - 1;
      console.log(
        `Transform TODO (remove) after: ${mdfc.body_array[index]}`
      );
    }

    return mdfc;
  }
}
