//! Teste: Das neue Curcuma

import {
  Markdown_IO,
  NOP_Task,
  Runner,
} from "../src/lib/curcuma";

import {
  MD_Callout_Task,
  MD_Math_Paragraph_Task,
  MD_Math_Inline_Task,
  MD_Writer_Task,
  MD_ObsidianLink_Task,
  MD_Splitter_Task,
  MD_RemoveTODOS_Task,
  MD_Frontmatter_Task,
  MD_Frontmatter_Template,
} from "../src/lib/curcuma/tasks/markdown";

const runner = new Runner<string>();

runner.addReader(
  new Markdown_IO<string>({
    //* this is a Markdown_IO_Props_Interface
    // readPath: "test-data-obsidian-vault/some-md-docs",
    readPath: "test-data-obsidian-vault/longform.md",
    writePath: "test-data-hugo/hugo-content-new/",
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
      source:"test-data-obsidian-vault/attachments/",
      target:"test-data-hugo/hugo-content-neu/static/downloads/",
      simulate:false
    }
  })
);


runner.addTask(
  new MD_Frontmatter_Task<string>({
    //* this is a MD_FrontmatterTask_Parameter_Type
    frontmatter_filename: "./test-data-obsidian-vault/frontmatter-template.md",
    frontmatter: {}
  })
);


runner.addTask(
  new MD_RemoveTODOS_Task<string>({
    //* this is a MD_Task_Parameter_Type - subset
    find_rule: "- [ ] #TODO ",
    replace_template: "",
  })
);



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

runner.addTask(
  new MD_Splitter_Task<string>({
    // this is a MD_Splitter_Parameter_Type
    pattern: "# ",
    cleanName: "# ",
    limit: 100,
    hasCounter: false,
    weightBase: 8000,
    url_prefix: "test-prefix",
    doRemoveHeadline: true,
    frontmatter_filename: "./test-data-obsidian-vault/frontmatter-template.md",
    frontmatter: frontmatter_template
  })
);

runner.addTask(new MD_Writer_Task()); // TODO

//! Wenn kein writer definiert ist wird der reader benutzt.
// runner.addWriter();

runner.run();
