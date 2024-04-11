import { MD_Document, MD_Document_Parameter_Type } from "../md-document";
import {
  MD_TRANSPORTER_COMMANDS,
  MD_Transporter_Parameter_Type,
} from "../md-transporter";
import { MD_Filesystem, MD_FileContent_Interface } from "../md-filesystem";
import {
  MD_Frontmatter_Template
} from "../md-frontmatter";
import { MD_Observer_Interface } from "../md-observer";
import { MD_Transformer_AbstractBase } from "../md-transformer";

export interface MD_Splitter_Parameter_Type {
  pattern: string;
  cleanName: string;
  limit: number;
  hasCounter: boolean;
  weightBase: number;
  url_prefix: string;
  doRemoveHeadline: boolean;
  frontmatter_filename: string;
  frontmatter: MD_Frontmatter_Template;
}

export class MD_Splitter_Transformer extends MD_Transformer_AbstractBase {
  parameter: MD_Splitter_Parameter_Type;
  md_document: MD_Document | null | undefined = null;
  counter: number = 0;

  constructor(parameter: MD_Splitter_Parameter_Type) {
    super();
    this.parameter = parameter;
    this.parameter.frontmatter_filename = parameter.frontmatter_filename.trim();

    // file overwrites property parameter.frontmatter
    if (
      parameter.frontmatter_filename.length > 0 &&
      MD_Filesystem.is_file_exist(parameter.frontmatter_filename)
    ) {
      const frontmatter: MD_Frontmatter_Template = new MD_Frontmatter_Template(
        ""
      );
      frontmatter.load(parameter.frontmatter_filename);
      parameter.frontmatter = frontmatter;
    }
  }

  public set_job_parameter(job_paramter: MD_Transporter_Parameter_Type): void {
    super.set_job_parameter(job_paramter);
    // Das ist ein Hack.
    //? Eigentlich ist die Methode ja in der abstrakten Basisklasse vorhanden.
    // Sie wird aber nicht erkannt bei übergabe als Parameter. zB: function(task:MD_Transformer_Interface)
  }

  public addObserver(observer: MD_Observer_Interface) {
    super.addObserver(observer);
  }

  /**
   *
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
    //
    // Record change...
    // Found a heading to split up
    // TODO Potential content before the first headline gets lost.
    // But my longform documents always start with a # headline.
    if (file_content.body_array[index].indexOf(this.parameter.pattern) == 0) {
      this.counter = this.counter + 1;

      if (
        typeof this.parameter.limit != "undefined" &&
        this.counter > this.parameter.limit
      )
        return file_content;

      if (this.md_document !== null) {
        this.md_document.write_file(this.job_parameter.writePath);
      }

      let params: MD_Document_Parameter_Type = {
        split_row: file_content.body_array[index],
        cleanName: this.parameter.cleanName,
        weightBase: this.parameter.weightBase,
        url_prefix: this.parameter.url_prefix,
        frontmatter: this.parameter.frontmatter,
        useCounter: this.parameter.hasCounter,
        counter: this.counter,
      };

      this.md_document = new MD_Document(params);

      // remove the Headline itself, because it is now in frontmatter.
      // 2nd parameter means remove one item only
      if (this.parameter.doRemoveHeadline)
        file_content.body_array.splice(index, 1);
    } else {
      if (this.md_document !== null) {
        this.md_document.add_content(file_content.body_array[index]);
      }
    }

    // save the last collection...
    if (
      this.md_document !== null &&
      index == file_content.body_array.length - 1
    ) {
      this.md_document.write_file(this.job_parameter.writePath);
    }

    // inform MD_Export not to write the entire file after splitting ist up.
    this.observer_subject.notify_all(
      "md-splitter-task",
      "md-exporter",
      MD_TRANSPORTER_COMMANDS.DO_NOT_WRITE_FILES
    );

    return file_content;
  }
}
