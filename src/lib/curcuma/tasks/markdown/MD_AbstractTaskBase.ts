import { Filesystem } from "../../filesystem";
import { IO_Meta_Interface, Task_Interface } from "../../types";
import {
  MD_FileContent,
  MD_FileContent_Interface,
} from "./helpers/markdown-filecontent";

export abstract class MD_AbstractTaskBase<T extends string>
  implements Task_Interface<T>
{
  constructor() {}
  
  // TODO Provide observer stuff

  perform(dao: T, io_meta: IO_Meta_Interface): T {
    // console.log("#######################################");
    // console.log("before", dao.data);

    // Trenne das Frontmatter vom body ab. siehe md-transporter.
    const mdfc: MD_FileContent_Interface =
      Filesystem.split_frontmatter_body(dao);

    for (var i = 0; i < mdfc.body_array.length; i++) {
      mdfc.index = i;
      const test: MD_FileContent_Interface = this.transform(mdfc, i, io_meta);
      if (test.index != i) i = test.index; // elements are added or removed
    }

    // führe alles wieder zusammen
    dao = Filesystem.merge_frontmatter_body(mdfc) as T;

    // console.log("after", dao.data);
    // console.log("#######################################");

    return dao;
  }

  protected abstract transform(
    dao: MD_FileContent,
    index: number,
    io_meta: IO_Meta_Interface
  ): MD_FileContent;
}
