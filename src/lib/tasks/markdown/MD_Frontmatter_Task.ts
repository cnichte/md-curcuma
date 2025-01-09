import {
  DAO_Interface,
  IO_Meta_Interface,
} from "../../io/types";

import { MD_MathTransformer_TemplateValues_Type } from "./MD_Math_Paragraph_Task";
import { MD_FileContent, MD_FileContent_Interface } from "./helpers/MD_FileContent";
import { MD_Observable_Abstract_TaskBase } from "./MD_Observable_Abstract_TaskBase";
import { Filesystem } from "../../core/filesystem";
import { Mapper, Mapper_Interface, Mapper_Item_Interface } from "../../core/mapper";
import { Task_Interface } from "../types";

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

  public perform(dao: DAO_Interface<T>): DAO_Interface<T> {
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
    // Is only executed the first time, and not for every line.
    if (index === 0) {
      // The one is like this:
      // file_content: MD_FileContent_Interface
      
      // TODO Das neue Frontmatter kommt entweder per file oder objekt.
      // TODO: Das DAO könnte auch frontmatter enthalten!
      mdfc.frontmatter;
      mdfc.frontmatter_attributes; // da ist noch nix...

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
        mdfc.frontmatter_attributes,
        ", Frontmatter-Target:",
        template_content.frontmatter_attributes
      );

      //* 2. Replace placeholder
      //* 2a. Is a property in Target > copy content over
      var fm_old = mdfc.frontmatter_attributes;
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
      mapper.do_mappings(mdfc.frontmatter_attributes, fm_new);
  
      // github.com/erikvullings/deep-copy-ts
      mdfc.frontmatter_attributes = { ...fm_new }; // clone

    } // if index===0

    return mdfc;
  }
}
