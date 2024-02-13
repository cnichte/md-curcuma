import { MD_Collection, MD_Collection_Parameter_Type } from "src/md-collection";
import { MD_EXPORTER_COMMANDS, MD_Exporter_Parameter_Type } from "src/md-exporter";
import { MD_Filesystem } from "src/md-filesystem";
import { MD_Frontmatter_Template } from "src/md-frontmatter";
import { MD_Observer_Interface } from "src/md-observer";
import { MD_Transformer_AbstractBase } from "src/md-transformer";

export interface MD_Splitter_Parameter_Type {
  pattern: string;
  cleanName: string;
  limit: number;
  hasCounter: boolean;
  weightBase: number;
  url_prefix: string;
  doRemoveHeadline: boolean;
  frontmatter_filename:string;
  frontmatter: MD_Frontmatter_Template;
}

export class MD_Splitter_Transformer extends MD_Transformer_AbstractBase {
  parameter: MD_Splitter_Parameter_Type;
  collection: MD_Collection | null | undefined = null;
  counter: number = 0;

  constructor(parameter: MD_Splitter_Parameter_Type) {
    super();
    this.parameter = parameter;
    this.parameter.frontmatter_filename = parameter.frontmatter_filename.trim();

    // file overwrites property parameter.frontmatter 
    if(parameter.frontmatter_filename.length>0 && MD_Filesystem.is_file_exist(parameter.frontmatter_filename)){
      const frontmatter: MD_Frontmatter_Template = new MD_Frontmatter_Template("");
      frontmatter.load(parameter.frontmatter_filename);
      parameter.frontmatter = frontmatter;
    }
  }

  public set_job_parameter(job_paramter: MD_Exporter_Parameter_Type): void {
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
   * @param {Array<string>} source
   * @param {number} index
   * @return {*}  {Array<string>}
   * @memberof MD_Splitter_Transformer
   */
  public transform(source: Array<string>, index: number): Array<string> {
    //
    // Record change...
    // Found a heading to split up
    // Potential content before the first headline gets lost.
    // But my longform documents always start with a # headline.
    if (source[index].indexOf(this.parameter.pattern) == 0) {
      this.counter = this.counter + 1;

      if (
        typeof this.parameter.limit != "undefined" &&
        this.counter > this.parameter.limit
      )
        return source;

      if (this.collection !== null) {
        this.collection.write_file(this.job_parameter.writePath);
      }

      let params: MD_Collection_Parameter_Type = {
        split_row: source[index],
        cleanName: this.parameter.cleanName,
        url_prefix: this.parameter.url_prefix,
        frontmatter: this.parameter.frontmatter,
        useCounter: this.parameter.hasCounter,
        counter: this.counter,
      };

      this.collection = new MD_Collection(params);

      // remove the Headline itself, because it is now in frontmatter.
      // 2nd parameter means remove one item only
      if (this.parameter.doRemoveHeadline) source.splice(index, 1);
    } else {
      if (this.collection !== null) {
        this.collection.add_content(source[index]);
      }
    }

    // save the last collection...
    if (this.collection !== null && index==source.length-1) {
       this.collection.write_file(this.job_parameter.writePath);
    }

    // inform MD_Export not to write the entire file after splitting ist up.
    this.observer_subject.notify_all("md-splitter-task", "md-exporter",  MD_EXPORTER_COMMANDS.DO_NOT_WRITE_FILES);

    return source;
  }
}
