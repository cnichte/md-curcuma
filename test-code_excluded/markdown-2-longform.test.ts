//! Teste: Das neue Curcuma

import {
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

import {
  Markdown_IO_Reader,
  Markdown_IO_ReadProps_Interface,
} from "../src/lib/io";

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

let r_props:Markdown_IO_ReadProps_Interface = {
  path: "test-data/hugo/hugo-content-2-longform/",
  simulate: false,
  doSubfolders: false,
  limit: 0,
  useCounter: false
}

runner.addReader(
  new Markdown_IO_Reader<string>(r_props)
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
    frontmatter_filename: "./test-data/obsidian-vault/frontmatter-template.md",
    frontmatter: frontmatter_template,
  })
);

//! Wenn kein writer definiert ist wird der reader benutzt.
// runner.addWriter();

runner.run();
