//! Teste: Das neue Curcuma

import {
  Mapping,
  Mapping_Item,
  Mapping_Task_Properties,
  Markdown_IO,
  NOP_Task,
  Runner,
} from "../src/lib";

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
    readPath: "test-data-obsidian-vault/longform.md",
    writePath: "test-data-hugo/hugo-content-2-longform/",
    doSubfolders: false,
    limit: 1990,
    useCounter: false,
    simulate: true,
  })
);

runner.addTask(
  new MD_Splitter_Task<string>({
    pattern: "# ",
    cleanName: "# ",
    limit: 100,
    hasCounter: false,
    weightBase: 8000,
    url_prefix: "test-prefix",
    doRemoveHeadline: true,
    frontmatter_filename: "./test-data-obsidian-vault/frontmatter-template.md",
    frontmatter: frontmatter_template,
  })
);

//! Wenn kein writer definiert ist wird der reader benutzt.
// runner.addWriter();

runner.run();
