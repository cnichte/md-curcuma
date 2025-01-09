import { IO_Meta_Interface } from "../../io/types";
import { Observable_Abstract_TaskBase } from "../Observable_Abstract_TaskBase";
import { Task_Interface } from "../types";
import {
  MD_FileContent,
  MD_FileContent_Interface,
} from "./helpers/MD_FileContent";

/**
 ** Processes the markdown dao paragraph by paragraph.
 * Calls the 'transform' method for each paragraph.
 */
export abstract class MD_Observable_Abstract_TaskBase<T extends string>
  extends Observable_Abstract_TaskBase<T>
  implements Task_Interface<T>
{
  constructor() {
    super();
  }

  perform(dao: T, io_meta: IO_Meta_Interface): T {

    // TODO REFACTOR: Der Code sollte in markdown-io reader umziehen.
    // TODO REFACTOR: Das DAO sollte komplett mdfc bzw. ein Objekt: mdfc + i 
    // Vermutliche brauch ich dann diese Basisklasse und transform nichte mehr.

    // console.log("#######################################");
    // console.log("before", dao.data);

    // Trenne das Frontmatter vom body ab. siehe md-transporter.
    const mdfc: MD_FileContent_Interface =
    MD_FileContent.split_frontmatter_body(dao);

    for (var i = 0; i < mdfc.body_array.length; i++) {
      mdfc.index = i;
      const test: MD_FileContent_Interface = this.transform(mdfc, i, io_meta);
      if (test.index != i) i = test.index; // elements are added or removed
    }

    // führe alles wieder zusammen
    dao = MD_FileContent.merge_frontmatter_body(mdfc) as T;

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
