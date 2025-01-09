import {
  Task_Interface,
  IO_Meta_Interface,
} from "../../types";

import { MD_MathTransformer_TemplateValues_Type } from "./MD_Math_Paragraph_Task";
import { MD_FileContent, MD_FileContent_Interface } from "./helpers/MD_FileContent";
import { MD_Observable_Abstract_TaskBase } from "./MD_Observable_Abstract_TaskBase";
import { Filesystem } from "../../filesystem";
import { Mapper, Mapper_Interface, Mapper_Item_Interface } from "../../mapper";

export interface MD_FrontmatterTask_Parameter_Type {
  frontmatter_filename: string;
  frontmatter: any;
  mappings: Mapper_Interface<any>[]; // TODO not any, but...
}

export class MD_Frontmatter_Task<T extends string> extends MD_Observable_Abstract_TaskBase<T> implements Task_Interface<T>
{
  parameter: MD_FrontmatterTask_Parameter_Type;
  collection: string[] | null | undefined = null;
  counter: number = 0;

  doCollect: boolean = false;

  protected template_values: MD_MathTransformer_TemplateValues_Type = {
    content: "",
  };

  constructor(parameter: MD_FrontmatterTask_Parameter_Type) {
    super();
    this.parameter = parameter;
  }

  public perform(dao: T, io_meta: IO_Meta_Interface): T {
    dao = super.perform(dao, io_meta);
    return dao;
  }

  /**
   * Is called by super.perform()
   * @param dao ist mdfc
   * @param index
   * @returns
   */
  protected transform(dao: MD_FileContent, index: number, io_meta: IO_Meta_Interface): MD_FileContent {
    // Is only executed the first time, and not for every line.
    if (index === 0) {
      // The one is like this:
      // file_content: MD_FileContent_Interface
      
      // TODO Das neue Frontmatter kommt entweder per file oder objekt.
      // TODO: Das DAO könnte auch frontmatter enthalten!
      dao.frontmatter;
      dao.frontmatter_attributes; // da ist noch nix...

      // The other like this:
      // this.frontmatter_target: MD_Frontmatter_Template
      const template_content: MD_FileContent_Interface =
      MD_FileContent.split_frontmatter_body(
          this.parameter.frontmatter.get_template_string() // TODO get_template_string is not a function
        );

      template_content.frontmatter;
      template_content.frontmatter_attributes;

      console.log(
        "Frontmatter-Source:",
        dao.frontmatter_attributes,
        ", Frontmatter-Target:",
        template_content.frontmatter_attributes
      );

      //* 2. Replace placeholder
      //* 2a. Is a property in Target > copy content over
      var fm_old = dao.frontmatter_attributes;
      var fm_new = template_content.frontmatter_attributes;

      for (let prop in fm_old) {
        // Is property in Target > copy content over.
        if (fm_new.hasOwnProperty(prop)) {
          fm_new[prop] = fm_old[prop];
        }
      }

      //* 2b. Map via Mapper
      // Ich muss eigentlich im target frontmatter nach den Platzhalten gucken, und die ersetzen...
      // oder... das geht wenn die propertynames == platzhalter sind: obj[name] -> {name}
      // das ersetzen erfolgt aus den attributen der quelle...
      // Was ist mit den Feldern aus dem Splitter? -> MD_Transformer_TemplateValues_Type aus md-transformer.
      const mapper = new Mapper<Mapper_Item_Interface>();
      mapper.addMappings(this.parameter.mappings);
      mapper.do_mappings(dao.frontmatter_attributes, fm_new);
  
      // github.com/erikvullings/deep-copy-ts
      dao.frontmatter_attributes = { ...fm_new }; // clone

    } // if index===0

    return dao;
  }
}
