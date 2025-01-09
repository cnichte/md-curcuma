import {
  Task_Interface,
  MD_Task_Parameter_Type,
  IO_Meta_Interface,
} from "../../types";
import { Filesystem } from "../../filesystem";
import { MD_FileContent, MD_FileContent_Interface } from "./helpers/MD_FileContent";
import { MD_Template } from "./helpers/MD_Template";
import { MD_Observable_Abstract_TaskBase } from "./MD_Observable_Abstract_TaskBase";

export interface MD_Callout_TemplateValues_Type {
  context: string;
  title: string;
  icon: string;
  content: string;
}

//TODO: Das was früher ein MD_Transporter
export class MD_Callout_Task<T extends string> extends MD_Observable_Abstract_TaskBase<T> implements Task_Interface<T> {
  parameter: MD_Task_Parameter_Type;
  collection: string[] | null | undefined = null;
  counter: number = 0;
  doCollect: boolean = false;

  protected template_values: MD_Callout_TemplateValues_Type = {
    context: "",
    title: "",
    icon: "",
    content: "",
  };

  protected a_mapping: any = {
    source_field_name: "type",
    target_field_name: "context",
    transformations: [
      { "note, seealso, example, quote, cite": "note" },
      { "info, todo, tip": "tip" },
      { "warning,caution, attention": "caution" },
      { "danger, failure, fail, missing": "danger" },
    ],
  };

  protected b_mapping: any = {
    source_field_name: "title",
    target_field_name: "title",
    transformations: "{value}",
  };

  protected c_mapping: any = {
    source_field_name: "icon",
    target_field_name: "title",
    transformations: "{value}",
  };

  protected mappings: any = [
    {
      "note, seealso": {
        context: "",
        icon: "",
      },
      "abstract, summary, tldr": {
        context: "",
        icon: "",
      },
      "info, todo": {
        context: "",
        icon: "",
      },
      "tip, hint, important": {
        context: "",
        icon: "",
      },
      "success, check, done": {
        context: "",
        icon: "",
      },
      "question, help, faq": {
        context: "",
        icon: "",
      },
      " warning, caution, attention": {
        context: "",
        icon: "",
      },
      "failure, fail, missing": {
        context: "",
        icon: "",
      },
      "danger, error": {
        context: "",
        icon: "",
      },
      bug: {
        context: "",
        icon: "",
      },
      example: {
        context: "",
        icon: "",
      },
      "quote, cite": {
        context: "",
        icon: "",
      },
    },
  ];

  constructor(parameter: MD_Task_Parameter_Type) {
    super()
    this.parameter = parameter;
  }

  public perform(dao: T, io_meta: IO_Meta_Interface): T {
    return super.perform(dao, io_meta);
  }

  /**
   * Is called by super.perform()
   * @param dao
   * @param index
   * @returns
   */
  protected transform(dao: MD_FileContent, index: number, io_meta: IO_Meta_Interface): MD_FileContent {
    let item = dao.body_array[index];

    // Callout beginnt als Absatz mit "> [!   ]"
    if (
      !this.doCollect &&
      item.indexOf(this.parameter.tag_obsidian_prefix) >= 0
    ) {
      // > [!"
      this.doCollect = true;
      console.group("callout task");
      // console.log("###########################################");
      // console.log("###########################################");
      console.log("#### callout: found!");
      this.collection = []; // may go over several lines

      const separator_pos = item.indexOf(this.parameter.tag_obsidian_suffix); // ]
      // TODO: colapsible, icon, mapping
      this.template_values.context = item.substring(
        this.parameter.tag_obsidian_prefix.length,
        separator_pos
      );
      this.template_values.title = item
        .substring(separator_pos + 1, item.length)
        .trim();

      dao.body_array.splice(index, 1); // Remove the line:
      dao.index = dao.index - 1;
      // start to collect
    } else if (this.doCollect) {
      const token_pos = item.indexOf(">");

      if (token_pos >= 0) {
        // Only remove, if the next line also belongs to the callout.
        // The last line in the callout is overwritten by the replacement.
        let next_item = dao.body_array[index + 1];
        if (next_item.indexOf(">") >= 0) {
          this.collection.push(
            item.substring(token_pos + 1, item.length).trim()
          );
          dao.body_array.splice(index, 1);
          dao.index = dao.index - 1;
        }
      } else {
        this.doCollect = false;
        console.log(
          "#### callout: process!",
          this.collection,
          this.template_values
        );
        // console.log("###########################################");
        // console.log("###########################################");
        console.groupEnd();
        // end collection, build with template, apply...
        this.template_values.content = this.collection.join("\n");
        const template: MD_Template = new MD_Template(
          this.parameter.replace_template
        );

        dao.body_array[index] = template.fill(this.template_values);
      }
    }

    return dao;
  }
}
