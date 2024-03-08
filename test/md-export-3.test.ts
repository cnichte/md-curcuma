import {
  MD_Frontmatter_Parameter_Type,
  MD_Frontmatter_Template,
} from "../src/lib/md-frontmatter";

import { MD_Exporter, MD_Exporter_Parameter_Type } from "../src/lib/md-exporter";
import { MD_Transformer_Parameter_Type } from "../src/lib/md-transformer";
import { MD_Splitter_Parameter_Type } from "../src/lib/transformer/md-splitter-task";
import { MD_ObsidianLink_Transformer } from "../src/lib/transformer/md-obsidian-link-task";
import { MD_RemoveTODOS_Transformer } from "../src/lib/transformer/md-remove-todos-task";
import { MD_Frontmatter_Transformer } from "../src/lib/transformer/md-frontmatter-task";

import { type MD_Mapping } from "../src/lib/md-mapping";
import { MD_Mapping_BooleanInverse_Task } from "../src/lib/mapping-tasks/mapping-boolean-inverse-task";
import { MD_Mapping_Copy_Task } from "../src/lib/mapping-tasks/mapping-copy-task";

/**
 * This test deals with transforming a couple of Obsidian-Markdown Documents.
 * Inserting/Replacing a frontmatter.
 * Adopting and transforming values from the source frontmatter.
 */
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
  simulate: simulate_job,
};

// The tasks to operate. If you add no tasks you have a simple copy job.

// The placeholders result from the definition of MD_Frontmatter_Type in md-frontmatter
// A file definition in frontmatter_filename, overwrites frontmatter Property
// {url_prefix}-{url}-{uuid}
var document_frontmatter: MD_Frontmatter_Template =
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

// use one of the predefined tasks like so:
// task: new MD_Mapping_BooleanInverse_Task()
// or write a custom task:
const map_1: MD_Mapping = {
  source_property_name: "doPublish",
  target_poperty_name: "draft",
  task: {
    perform: function (source_value: boolean, target_value: boolean): boolean {
      target_value = !source_value;
      return target_value;
    },
  },
};

// Ein Beispiel Task, der das aktuelle Datum einfügt.
const map_2: MD_Mapping = {
  source_property_name: "",
  target_poperty_name: "date",
  task: {
    perform: function (source_value: any, target_value: any): any {
      return new Date().toJSON().slice(0, 16);
    },
  },
};

const parameter_frontmatter: MD_Frontmatter_Parameter_Type = {
  frontmatter: document_frontmatter,
  frontmatter_filename: "",
  mappings: [map_1, map_2],
};

exporter.addTransformer(new MD_Frontmatter_Transformer(parameter_frontmatter));

exporter.perform_job(exporter_parameter);
