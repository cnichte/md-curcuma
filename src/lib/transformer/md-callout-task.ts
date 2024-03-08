import { MD_Template } from "src/lib/md-template";
import { MD_Exporter_Parameter_Type } from "../md-exporter";
import { MD_FileContent_Interface } from "../md-filesystem";
import { MD_Observer_Interface } from "../md-observer";
import {
  MD_Transformer_AbstractBase,
  MD_Transformer_Parameter_Type,
} from "../md-transformer";

export interface MD_Callout_TemplateValues_Type {
  context: string;
  title: string;
  icon: string;
  content: string;
}

export class MD_Callout_Transformer extends MD_Transformer_AbstractBase {
  parameter: MD_Transformer_Parameter_Type;
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

  constructor(parameter: MD_Transformer_Parameter_Type) {
    super();
    this.parameter = parameter;
  }

  public set_job_parameter(job_paramter: MD_Exporter_Parameter_Type): void {
    super.set_job_parameter(job_paramter);
  }

  public addObserver(observer: MD_Observer_Interface) {
    super.addObserver(observer);
  }

  /**
   * Callouts übersetzen.
   * Obsidian: https://help.obsidian.md/Editing+and+formatting/Callouts
   * Hugo: https://getdoks.org/docs/basics/shortcodes/
   *
   * @param {MD_FileContent_Interface} file_content
   * @param {number} index
   * @return {*}  {Array<string>}
   * @memberof MD_Splitter_Transformer
   */
  public transform(
    file_content: MD_FileContent_Interface,
    index: number
  ): MD_FileContent_Interface {
    let item = file_content.body_array[index];

    // Callout beginnt als Absatz mit "> [!   ]"
    if (
      !this.doCollect &&
      item.indexOf(this.parameter.tag_obsidian_prefix) >= 0
    ) {
      // > [!"
      this.doCollect = true;
      console.group('callout task');
      console.log("###########################################");
      console.log("###########################################");
      console.log("#### callout: found!");
      this.collection = []; // may go over several lines

      const separator_pos = item.indexOf(this.parameter.tag_obsidian_suffix); // ]
      // TODO: colapsible, icon, mapping
      this.template_values.context = item.substring(
        this.parameter.tag_obsidian_prefix.length,
        separator_pos
      );
      this.template_values.title = item.substring(separator_pos+1, item.length).trim();

      file_content.body_array.splice(index, 1); // Remove the line:
      file_content.index = file_content.index - 1;
      // start to collect
    } else if (this.doCollect) {

      const token_pos = item.indexOf(">");

      if (token_pos >= 0) {
        // Only remove, if the next line also belongs to the callout.
        // The last line in the callout is overwritten by the replacement.
        let next_item = file_content.body_array[index+1];
        if (next_item.indexOf(">") >= 0) {
          this.collection.push(item.substring(token_pos+1, item.length).trim());
          file_content.body_array.splice(index, 1);
          file_content.index = file_content.index - 1;
        }
      } else {
        this.doCollect = false;
        console.log("#### callout: process!", this.collection, this.template_values);
        console.log("###########################################");
        console.log("###########################################");
        console.groupEnd();
        // end collection, build with template, apply...
        this.template_values.content = this.collection.join("\n");
        const template: MD_Template = new MD_Template(
          this.parameter.replace_template
        );

        file_content.body_array[index] = template.fill(this.template_values);
      }
    }

    return file_content;
  }
}
