import {
  Task_Interface,
  MD_FileContent_Interface,
  MD_Task_Parameter_Type,
  DAO_META_Interface,
} from "../../types";

import { MD_Filesystem } from "../../../md-filesystem";
import { MD_Template } from "../../../md-template";

export interface MD_Callout_TemplateValues_Type {
  context: string;
  title: string;
  icon: string;
  content: string;
}

export class MD_FileContent implements MD_FileContent_Interface {
  frontmatter: string = "";
  frontmatter_attributes: any = "";
  body_array: string[] = [];
  index: number = 0;
}

//TODO: Das was früher ein MD_Transporter
export class MD_Callout_Task<T extends string> implements Task_Interface<T> {
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
    this.parameter = parameter;
  }

  public perform(dao: T, dao_meta: DAO_META_Interface): T {
    // console.log("#######################################");
    // console.log("before", dao.data);

    // Trenne das Frontmatter vom body ab. siehe md-transporter.
    const mdfc: MD_FileContent_Interface = MD_Filesystem.split_frontmatter_body(
      dao as string
    );

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
