//! Teste: Das neue Curcuma
import { Runner } from "../src/lib/core";
import {Image_IO } from "../src/lib/io";
import { Exif_Task } from "../src/lib/tasks";

const runner = new Runner<string>();

runner.addReader(
  new Image_IO<string>({
    // Markdown_IO_ReadProps_Interface
    path: "test-data-exif/images",
    doSubfolders: false,
    limit: 5,
    useCounter: false,
    simulate: false,
  })
);

//! Wenn kein writer definiert ist wird der reader benutzt.
// runner.addWriter();

runner.addTask(new Exif_Task<any>({}));


runner.run();
