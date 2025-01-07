import { Markdown_DAO, Markdown_IO, Markdown_IO_Props_Interface, MD_Writer_Task, NOP_Task, Runner } from "../src/lib/curcuma";

//! Teste: Das neue Curcuma

const runner = new Runner<Markdown_DAO<string>, Markdown_IO_Props_Interface>();

// Markdown_IO_Props_Interface
/* 
*/

runner.addReader( new Markdown_IO({
    readPath: "test-data-obsidian-vault/some-md-docs",
    writePath: "test-data-hugo/hugo-content-new/",
    doSubfolders: false,
    limit: 1990,
    useCounter: false,
    simulate: true,
  }));

runner.addTask(new NOP_Task());
runner.addTask(new MD_Writer_Task());

// runner.addWriter();

runner.run();