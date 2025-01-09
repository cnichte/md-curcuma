import {
  DAO_Interface,
  IO_Meta_Interface,
} from "../../io/types";

import { Filesystem } from "../../core/filesystem";
import { MD_Frontmatter_Template } from "./helpers/MD_Frontmatter_Template";
import { MD_FileContent } from "./helpers/MD_FileContent";
import { MD_Document, MD_Document_Parameter_Type } from "./helpers/MD_Document";
import { MD_Observable_Abstract_TaskBase } from "./MD_Observable_Abstract_TaskBase";
import { Task_Interface } from "../types";

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


//TODO: Das was früher ein MD_Transporter
export class MD_Splitter_Task<T extends string> extends MD_Observable_Abstract_TaskBase<T> implements Task_Interface<T>
{
  parameter: MD_Splitter_Parameter_Type;
  md_document: MD_Document | null | undefined = null;
  counter: number = 0;

  io_meta:any;

  constructor(parameter: MD_Splitter_Parameter_Type) {
    super();
    this.parameter = parameter;
    this.parameter.frontmatter_filename = parameter.frontmatter_filename.trim();

    // file overwrites property parameter.frontmatter
    if (
      parameter.frontmatter_filename.length > 0 &&
      Filesystem.is_file_exist(parameter.frontmatter_filename)
    ) {
      const frontmatter: MD_Frontmatter_Template = new MD_Frontmatter_Template(
        ""
      );
      frontmatter.load(parameter.frontmatter_filename);
      // parameter.frontmatter = frontmatter;
    }
  }

  public perform(dao: DAO_Interface<T>): DAO_Interface<T> {
    dao = super.perform(dao);
    this.io_meta = dao.io_meta
    return dao;
  }

  /**
   * Is called by super.perform()
   * @param mdfc
   * @param index
   * @returns
   */
  protected transform(mdfc: MD_FileContent, index: number): MD_FileContent {

    //
    // Record change...
    // Found a heading to split up
    // TODO Potential content before the first headline gets lost.
    // But my longform documents always start with a # headline.
    if (mdfc.body_array[index].indexOf(this.parameter.pattern) == 0) {
      this.counter = this.counter + 1;

      if (
        typeof this.parameter.limit != "undefined" &&
        this.counter > this.parameter.limit
      )
        return mdfc;

      if (this.md_document !== null) {
        this.md_document.write_file(this.io_meta.file_name_writer);
      }

      let params: MD_Document_Parameter_Type = {
        split_row: mdfc.body_array[index],
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
        mdfc.body_array.splice(index, 1);
    } else {
      if (this.md_document !== null) {
        this.md_document.add_content(mdfc.body_array[index]);
      }
    }

    // save the last collection...
    if (
      this.md_document !== null &&
      index == mdfc.body_array.length - 1
    ) {
      this.md_document.write_file(this.io_meta.file_name_writer);
    }

    // inform not to write the entire file after splitting ist up.
    super.notify_all({
      from: "md-splitter-task",
      to: "runner",
      command: "do-not-io-write",
      dao: null,
    })

    return mdfc;
  }
}
