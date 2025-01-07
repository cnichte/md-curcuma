//! Teste: Das neue Curcuma

import {
  Mapping,
  Mapping_Item,
  MappingTask_Properties,
  Markdown_IO,
  Markdown_IO_Props_Interface,
  MD_Task_Parameter_Type,
  NOP_Task,
  Runner,
} from "../src/lib/curcuma";

import {
  MD_Callout_Task,
  MD_Math_Paragraph_Task,
  MD_Math_Inline_Task,
  MD_Writer_Task,
  MD_ObsidianLink_Task,
} from "../src/lib/curcuma/tasks/markdown";

const runner = new Runner<string, Markdown_IO_Props_Interface>();

runner.addReader(
  new Markdown_IO<string, Markdown_IO_Props_Interface>({
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

runner.addTask(new NOP_Task());

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

runner.addTask(new MD_Writer_Task());

// runner.addWriter();

runner.run();
