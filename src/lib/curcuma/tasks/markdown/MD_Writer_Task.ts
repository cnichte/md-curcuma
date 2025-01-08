import { IO_Meta_Interface, Task_Interface } from "../../types";
import { MD_FileContent } from "./helpers/markdown-filecontent";
import { MD_Observable_Abstract_TaskBase } from "./MD_Observable_Abstract_TaskBase";

/**
 * TODO: Schreibt eine Markdown Datei.
 */
export class MD_Writer_Task<T> extends MD_Observable_Abstract_TaskBase<T> implements Task_Interface<T> {

    perform(dao:T, io_meta: IO_Meta_Interface): T {
        dao = super.perform(dao, io_meta);       
        return dao;
    }

    protected transform(dao: MD_FileContent, index: number, io_meta: IO_Meta_Interface): MD_FileContent {
        return dao;
    }
}