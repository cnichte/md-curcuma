//! Teste: Das neue Curcuma

import {
  Mapping,
  Mapping_Item,
  MappingTask_Properties,
  Markdown_DAO,
  Markdown_IO,
  Markdown_IO_Props_Interface,
  NOP_Task,
  Runner,
} from "../src/lib/curcuma";

import {
  MD_Callout_Task,
  MD_Math_Paragraph_Task,
  MD_Math_Inline_Task,
  MD_Transformer_Parameter_Type,
  MD_Writer_Task,
} from "../src/lib/curcuma/tasks/markdown";

const runner = new Runner<Markdown_DAO<string>, Markdown_IO_Props_Interface>();

// Markdown_IO_Props_Interface

runner.addReader(
  new Markdown_IO({
    readPath: "test-data-obsidian-vault/some-md-docs",
    writePath: "test-data-hugo/hugo-content-new/",
    doSubfolders: false,
    limit: 1990,
    useCounter: false,
    simulate: true,
  })
);

runner.addTask(new NOP_Task());

runner.addTask(
  new MD_Callout_Task({
    // this is a MD_Transformer_Parameter_Type
    tag_obsidian_prefix: "> [!",
    tag_obsidian_suffix: "]",
    replace_template: "{{< callout context=\"{context}\" title=\"{title}\" icon=\"{icon}\" > }} {content} {{< /callout >}}",
  })
);

runner.addTask(
  new MD_Math_Paragraph_Task({
    tag_obsidian_prefix: "$$",
    tag_obsidian_suffix: "$$",
    replace_template: "```math {.text-center}\n$$\n {content} \n$$\n```\n",
  })
);

runner.addTask(
  new MD_Math_Inline_Task({
    tag_obsidian_prefix: "$",
    tag_obsidian_suffix: "$",
    replace_template: "{{< math >}} ${content}$ {{< /math >}}" ,
  })
);

runner.addTask(new MD_Writer_Task());

// runner.addWriter();

runner.run();
