import { IO_Meta_Interface, Task_Interface } from "../../types";
import { MD_FileContent } from "./helpers/markdown-filecontent";
import { MD_Observable_Abstract_TaskBase } from "./MD_Observable_Abstract_TaskBase";

/**
 * TODO: Ein Task, der eine Markdown Datei schreibt.
 */
export class MD_Writer_Task<T extends string> extends MD_Observable_Abstract_TaskBase<T> implements Task_Interface<T> {

    perform(dao:T, io_meta: IO_Meta_Interface): T {
        dao = super.perform(dao, io_meta);       
        return dao;
    }

    /**
     * Is called by super.perform()
     * @param dao 
     * @param index 
     * @param io_meta 
     * @returns 
     */
    protected transform(dao: MD_FileContent, index: number, io_meta: IO_Meta_Interface): MD_FileContent {
        return dao;
    }
}