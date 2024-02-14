import { MD_CopyTask_Type } from '../src/md-transformer';
import { MD_Frontmatter_Template } from "../src/md-frontmatter";
import { MD_Exporter, MD_Exporter_Parameter_Type } from "../src/md-exporter";
import { MD_Transformer_Parameter_Type } from "../src/md-transformer";
import { MD_Splitter_Parameter_Type } from "../src/transformer/md-splitter-task";
import { MD_ObsidianLink_Transformer } from "../src/transformer/md-obsidian-link-task";
import { MD_RemoveTODOS_Transformer } from "../src/transformer/md-remove-todos-task";
import { MD_Frontmatter_Parameter_Type, MD_Frontmatter_Transformer } from '../src/transformer/md-frontmatter-task';

const exporter: MD_Exporter = new MD_Exporter();

// Basic instructions for MD_Exporter

const simulate_job = false;
const simulate_copy_job = false;

const exporter_parameter: MD_Exporter_Parameter_Type = {
  readPath: "test/obsidian-vault/some-md-docs",
  writePath: "test/hugo-content-3/",
  doSubfolders: false,
  limit: 1990,
  useCounter: false,
  simulate: simulate_job
};

// The tasks to operate. If you add not tasks you have a simple copy job.

// The placeholders result from the definition of MD_Frontmatter_Type in md-frontmatter
// A file definition in frontmatter_filename, overwrites frontmatter Property
// {url_prefix}-{url}-{uuid}
var document_frontmatter: MD_Frontmatter_Template = new MD_Frontmatter_Template(`---
title: "{title}"
description: "{description}"
summary: "{summary}"
date: {creation-date}
draft: {draft}
weight: {weight}
categories: [{categories}]
tags: [{tags}]
contributors: [{authors}]
pinned: false
homepage: false
seo:
  title: "{seo-title}" # custom title (optional)
  description: "{seo-description}" # custom description (recommended)
  canonical: "" # custom canonical URL (optional)
  noindex: false # false (default) or true
---\n\n`);

const parameter_frontmatter: MD_Frontmatter_Parameter_Type = {
  frontmatter: document_frontmatter,
  frontmatter_filename: ''
};

exporter.addTransformer(new MD_Frontmatter_Transformer(parameter_frontmatter));

exporter.perform_job(exporter_parameter);
