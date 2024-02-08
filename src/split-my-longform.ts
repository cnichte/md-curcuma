import { MD_Splitter, type MD_Splitter_Parameter } from "./md-splitter";
import {MD_Frontmatter} from "./md-frontmatter";
import {
  ObsidianLink_Transformer,
  RemoveTODOS_Transformer,
  type MD_Transformer_Parameter
} from "./md-transformer";


let splitter: MD_Splitter = new MD_Splitter();

// Placeholder in the Transformer-Template 
// as pre defined in MD_Transformer_TemplateValues in the md-transformer module:
// {name_full} {name_suffix} {name}

var parameter_images: MD_Transformer_Parameter = {
  tag_obsidian_prefix:"![[",
  tag_obsidian_suffix: "]]",
  find_rule: "jpg|png",
  replace_template: `{{< image src="assets/images/{name_full}" >}}`
};

var parameter_docs: MD_Transformer_Parameter = {
  tag_obsidian_prefix:"![[",
  tag_obsidian_suffix: "]]",
  find_rule: "pdf|ods|odp",
  replace_template: `{{< button href="/getthis.php?id={name}" name="download {name} ({name_suffix})" >}}`
};

splitter.addTransformer(new ObsidianLink_Transformer(parameter_images));
splitter.addTransformer(new ObsidianLink_Transformer(parameter_docs));
splitter.addTransformer(new RemoveTODOS_Transformer("- [ ] #TODO "));

// The placeholders result from the definition of MD_FrontmatterType in md-frontmatter
var frontmatter:MD_Frontmatter = new MD_Frontmatter(`---
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

// Die Parameter bitte anpassen
let parameter: MD_Splitter_Parameter = {
  readPath:
    "test/obsidian-vault/longform.md",
  writePath: "test/hugo-content/",
  pattern: "# ",
  cleanName: "# ",
  limit: 100,
  hasCounter: true,
  weightBase: 8011,
  url_prefix: "my-prefix",
  doRemoveHeadline: true,
  frontmatter: frontmatter
};

splitter.split_longform(parameter);