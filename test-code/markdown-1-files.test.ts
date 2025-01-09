//! Teste: Das neue Curcuma

import { Runner } from "../src/lib/core";
import { Mapper_Interface, Mapper_Item_Interface, Mapper_Properties } from "../src/lib/core/mapper";
import { Markdown_IO } from "../src/lib/io";
import { NOP_Task } from "../src/lib/tasks";

import {
  MD_Callout_Task,
  MD_Math_Paragraph_Task,
  MD_Math_Inline_Task,
  MD_Writer_Task,
  MD_ObsidianLink_Task,
  MD_RemoveTODOS_Task,
  MD_Frontmatter_Task,
  MD_Frontmatter_Template,
} from "../src/lib/tasks/markdown";


var frontmatter_template: MD_Frontmatter_Template =
  new MD_Frontmatter_Template(`---
title: ""
description: ""
summary: ""
date:
draft:
weight: 
categories: []
tags: []
contributors: []
pinned: false
homepage: false
seo:
  title: "" # custom title (optional)
  description: "" # custom description (recommended)
  canonical: "" # custom canonical URL (optional)
  noindex: false # false (default) or true
---\n\n`);


const runner = new Runner<string>();

runner.addReader(
  new Markdown_IO<string>({
    //* this is a Markdown_IO_Props_Interface
    readPath: "test-data_obsidian-vault/some-md-docs",
    writePath: "test-data_hugo/hugo-content-new/",
    doSubfolders: false,
    limit: 1990,
    useCounter: false,
    simulate: true,
  })
);

runner.addTask(new NOP_Task<string>());

runner.addTask(
  new MD_Callout_Task<string>({
    //* this is a MD_Task_Parameter_Type
    tag_obsidian_prefix: "> [!",
    tag_obsidian_suffix: "]",
    replace_template: "{{< callout context=\"{context}\" title=\"{title}\" icon=\"{icon}\" > }} {content} {{< /callout >}}",
  })
);

runner.addTask(
  new MD_Math_Paragraph_Task<string>({
    //* this is a MD_Task_Parameter_Type
    tag_obsidian_prefix: "$$",
    tag_obsidian_suffix: "$$",
    replace_template: "```math {.text-center}\n$$\n {content} \n$$\n```\n",
  })
);

runner.addTask(
  new MD_Math_Inline_Task<string>({
    //* this is a MD_Task_Parameter_Type
    tag_obsidian_prefix: "$",
    tag_obsidian_suffix: "$",
    replace_template: "{{< math >}} ${content}$ {{< /math >}}" ,
  })
);

runner.addTask(
  new MD_ObsidianLink_Task<string>({
    //* this is a MD_Task_Parameter_Type
    tag_obsidian_prefix: "![[",
    tag_obsidian_suffix: "]]",
    find_rule: "pdf|ods|odp",
    replace_template:  "{{< button href=\"/getthis.php?id={name}\" name=\"download {name} ({name_suffix})\" >}}",
    copy_task:{
      source:"test-data_obsidian-vault/attachments/",
      target:"test-data_hugo/hugo-content-new/static/downloads/",
      simulate:false
    }
  })
);


// use one of the predefined tasks like so:
// task: new Mapping_BooleanInverse_Task()
// or write a custom task like so:
const map_1: Mapper_Interface<Mapper_Item_Interface> = {
  mapping_items: [
    {
      source_property_name: "doPublish",
      target_poperty_name: "draft",
    }
  ],
  task: {
    perform: function (mapping_properties: Mapper_Properties): boolean {
      if (typeof mapping_properties.source_value == "boolean") { }
      return !mapping_properties.source_value;
    },
  }
};

// An example task that inserts the current date. Source Property isnt used here.
const map_2: Mapper_Interface<Mapper_Item_Interface> = {
  mapping_items: [{
    source_property_name: "",
    target_poperty_name: "date",
  }],
  task: {
    perform: function (mapping_properties: Mapper_Properties) {
      return new Date().toJSON().slice(0, 16);
    },
  }
};

runner.addTask(
  new MD_Frontmatter_Task<string>({
        //* this is a MD_FrontmatterTask_Parameter_Type
        frontmatter_filename: "./test-data_obsidian-vault/frontmatter-template.md",
        frontmatter: frontmatter_template,
        mappings: [map_1, map_2]
  })
);


runner.addTask(
  new MD_RemoveTODOS_Task<string>({
    //* this is a MD_Task_Parameter_Type - subset
    find_rule: "- [ ] #TODO ",
    replace_template: "",
  })
);

runner.addTask(new MD_Writer_Task()); // TODO

//! Wenn kein writer definiert ist wird der reader benutzt.
// runner.addWriter();

runner.run();
