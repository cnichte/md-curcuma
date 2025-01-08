import {
  Task_Interface,
  IO_Meta_Interface,
} from "../../types";

import { MD_Filesystem } from "../../../md-filesystem";
import { MD_Frontmatter_Template } from "./helpers/markdown-frontmatter";
import { MD_FileContent, MD_FileContent_Interface } from "./helpers/markdown-filecontent";
import { Markdown_Document, Markdown_Document_Parameter_Type } from "./helpers/markdown-document";

export interface MD_Splitter_Parameter_Type {
  pattern: string;
  cleanName: string;
  limit: number;
  hasCounter: boolean;
  weightBase: number;
  url_prefix: string;
  doRemoveHeadline: boolean;
  frontmatter_filename: string;
  // TODO frontmatter: MD_Frontmatter_Template;
}


//TODO: Das was früher ein MD_Transporter
export class MD_Splitter_Task<T extends string>
  implements Task_Interface<T>
{
  parameter: MD_Splitter_Parameter_Type;
  md_document: Markdown_Document | null | undefined = null;
  counter: number = 0;

  constructor(parameter: MD_Splitter_Parameter_Type) {
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
      // parameter.frontmatter = frontmatter;
    }
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

    //
    // Record change...
    // Found a heading to split up
    // TODO Potential content before the first headline gets lost.
    // But my longform documents always start with a # headline.
    if (dao.body_array[index].indexOf(this.parameter.pattern) == 0) {
      this.counter = this.counter + 1;

      if (
        typeof this.parameter.limit != "undefined" &&
        this.counter > this.parameter.limit
      )
        return dao;

      if (this.md_document !== null) {
        this.md_document.write_file(this.job_parameter.writePath);
      }

      let params: Markdown_Document_Parameter_Type = {
        split_row: file_content.body_array[index],
        cleanName: this.parameter.cleanName,
        weightBase: this.parameter.weightBase,
        url_prefix: this.parameter.url_prefix,
        frontmatter: this.parameter.frontmatter,
        useCounter: this.parameter.hasCounter,
        counter: this.counter,
      };

      this.md_document = new Markdown_Document(params);

      // remove the Headline itself, because it is now in frontmatter.
      // 2nd parameter means remove one item only
      if (this.parameter.doRemoveHeadline)
        dao.body_array.splice(index, 1);
    } else {
      if (this.md_document !== null) {
        this.md_document.add_content(dao.body_array[index]);
      }
    }

    // save the last collection...
    if (
      this.md_document !== null &&
      index == dao.body_array.length - 1
    ) {
      this.md_document.write_file(this.job_parameter.writePath); // TODO aus Meta
    }

    // inform MD_Export not to write the entire file after splitting ist up.
    this.observer_subject.notify_all(
      "md-splitter-task",
      "md-exporter",
      MD_TRANSPORTER_COMMANDS.DO_NOT_WRITE_FILES
    );

    return dao;
  }
}
