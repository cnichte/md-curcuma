import { MD_Template } from "../md-template";
import { MD_Exporter_Parameter_Type } from "../md-exporter";
import { MD_FileContent_Interface } from "../md-filesystem";
import { MD_Observer_Interface } from "../md-observer";
import {
  MD_Transformer_AbstractBase,
  MD_Transformer_Parameter_Type,
} from "../md-transformer";

export interface MD_MathTransformer_TemplateValues_Type {
  content: string;
}

export class MD_MathParagraph_Transformer extends MD_Transformer_AbstractBase {
  parameter: MD_Transformer_Parameter_Type;
  collection: string[] | null | undefined = null;
  counter: number = 0;

  doCollect: boolean = false;

  protected template_values: MD_MathTransformer_TemplateValues_Type = {
    content: "",
  };

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

    // Formel als Absatz mit $$
    if (
      !this.doCollect &&
      item.indexOf(this.parameter.tag_obsidian_prefix) >= 0
    ) {
      // $$
      this.doCollect = true;
      console.log("#### math: found!");
      this.collection = []; // may go over several lines
      file_content.body_array.splice(index, 1); // Remove line: $$
      file_content.index = file_content.index - 1;
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
        file_content.body_array[index] = template.fill(this.template_values);
      } else {
        this.collection.push(item); // remember and remove
        file_content.body_array.splice(index, 1);
        file_content.index = file_content.index - 1;
        console.log("#### math: collect...", this.collection);
      }
    }
    return file_content;
  }
}

export class MD_MathInline_Transformer extends MD_Transformer_AbstractBase {
  parameter: MD_Transformer_Parameter_Type;

  protected template_values: MD_MathTransformer_TemplateValues_Type = {
    content: "",
  };

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
    let paragraph = file_content.body_array[index];
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

    file_content.body_array[index] = words_array.join(" ");

    return file_content;
  }
}
