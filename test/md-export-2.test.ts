import { MD_Frontmatter_Template } from "../src/md-frontmatter";
import { MD_Exporter, MD_Exporter_Parameter_Type } from "../src/md-exporter";
import { MD_Transformer_Parameter_Type } from "../src/md-transformer";
import { MD_Splitter_Transformer } from "../src/transformer/md-splitter-task";
import { MD_Splitter_Parameter_Type } from "../src/transformer/md-splitter-task";
import { MD_ObsidianLink_Transformer } from "../src/transformer/md-obsidian-link-task";
import { MD_RemoveTODOS_Transformer } from "../src/transformer/md-remove-todos-task";
import { MD_Math_Transformer } from "../src/transformer/md-math-task";

/**
 * This test deals with sharing a longform document 
 * about instantiated classes.
 */
const exporter: MD_Exporter = new MD_Exporter();

// Basic instructions for MD_Exporter

const exporter_parameter: MD_Exporter_Parameter_Type = {
  readPath: "test/obsidian-vault/longform.md",
  writePath: "test/hugo-content-2/",
  doSubfolders: false,
  limit: 1990,
  useCounter: false,
  simulate: false
};

const simulate_copy_job = false;

// The tasks to operate. If you add no tasks you have a simple copy job.

const parameter_images: MD_Transformer_Parameter_Type = {
  tag_obsidian_prefix: "![[",
  tag_obsidian_suffix: "]]",
  find_rule: "jpg|png",
  replace_template: `{{< image src="assets/images/{name_full}" >}}`,
  copy_task: {
    source:"test/obsidian-vault/images/",
    target:"test/hugo-content-2/assets/images/{name}/",
    simulate:simulate_copy_job
  }
};

const parameter_docs: MD_Transformer_Parameter_Type = {
  tag_obsidian_prefix: "![[",
  tag_obsidian_suffix: "]]",
  find_rule: "pdf|ods|odp",
  replace_template: `{{< button href="/getthis.php?id={name}" name="download {name} ({name_suffix})" >}}`,
  copy_task: {
    source:"test/obsidian-vault/attachments/",
    target:"test/hugo-content-2/static/downloads/",
    simulate:simulate_copy_job
  }
};

var parameter_math: MD_Transformer_Parameter_Type = {
  tag_obsidian_prefix: "$$",
  tag_obsidian_suffix: "$$",
  find_rule: "",
  replace_template: "```math {.text-center}\n$$\n {content} \n$$\n```\n",
};

const parameter_remove: MD_Transformer_Parameter_Type = {
  tag_obsidian_prefix: "", // TODO optional?
  tag_obsidian_suffix: "", // TODO optional?
  find_rule: "- [ ] #TODO ",
  replace_template: ``,
};

// The Markdown-Splitter Task needs a Frontmatter

// The placeholders result from the definition of MD_Frontmatter_Type in md-frontmatter
// A file definition in frontmatter_filename, overwrites frontmatter Property
var splitter_frontmatter: MD_Frontmatter_Template = new MD_Frontmatter_Template(`---
title: "{title}"
description: ""
url: /docs/{url_prefix}-{url}/
date: {date}
draft: false
images: []
menu:
  docs:
    parent: "docs-9602b15bad02600f3883f55e2ade6b81"
    identifier: "{url_prefix}-{url}-{uuid}"
weight: {weight}
toc: true
---\n\n`);

const parameter_splitter: MD_Splitter_Parameter_Type = {
  pattern: "# ",
  cleanName: "# ",
  limit: 100,
  hasCounter: false,
  weightBase: 8000,
  url_prefix: "test-prefix",
  doRemoveHeadline: true,
  frontmatter_filename: "", // ./test/frontmatter-template.md
  frontmatter: splitter_frontmatter
};

exporter.addTransformer(new MD_ObsidianLink_Transformer(parameter_images));
exporter.addTransformer(new MD_ObsidianLink_Transformer(parameter_docs));
exporter.addTransformer(new MD_RemoveTODOS_Transformer(parameter_remove));
exporter.addTransformer(new MD_Math_Transformer(parameter_math));
exporter.addTransformer(new MD_Splitter_Transformer(parameter_splitter));

exporter.perform_job(exporter_parameter);
