//! Teste: Das neue Curcuma

import {
  MD_Task_Parameter_Type,
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
  Markdown_IO_WriteProps_Interface,
  Markdown_IO_Writer,
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
  path: "test-data/obsidian-vault/longform.md",
  simulate: false,
  doSubfolders: false,
  limit: 0,
  useCounter: false
}

let w_props: Markdown_IO_WriteProps_Interface = {
  path: "test-data/hugo/longform-split/",
  simulate: false
};

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
    // MD_Splitter_Task has a build in Writer
    writer_props: w_props
  })
);

// TODO: Alle Transformer einbauen: 
// ... http://192.168.178.91:81/docs/md-curcuma-lib-manual/#2-obsidian-links

const parameter_images: MD_Task_Parameter_Type = {
  tag_obsidian_prefix: "![[",
  tag_obsidian_suffix: "]]",
  find_rule: "jpg|png",
  replace_template: `{{ < image src="assets/images//{name}/{name_full}" > }}`,
  copy_task: {
    source:"test-data/obsidian-vault/images/",
    target:"test-data/hugo/content/assets/images/{name}/",
    simulate:false
  }
};

const parameter_docs: MD_Task_Parameter_Type = {
  tag_obsidian_prefix: "![[",
  tag_obsidian_suffix: "]]",
  find_rule: "pdf|ods|odp",
  replace_template: `{{ < button href="/getthis.php?id={name}" name="download {name} ({name_suffix})" > }}`,
  copy_task: {
    source:"test-data/obsidian-vault/attachments/",
    target:"test-data/hugo/content/static/downloads/",
    simulate:false
  }
};

runner.addTask(new MD_ObsidianLink_Task(parameter_images));
runner.addTask(new MD_ObsidianLink_Task(parameter_docs));

runner.run();
