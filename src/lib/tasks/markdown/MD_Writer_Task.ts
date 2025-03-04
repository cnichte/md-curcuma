import { Data_Interface, IO_Meta_Interface } from "../../io/types";
import { Task_Interface } from "../types";
import { MD_FileContent } from "./helpers/MD_FileContent";
import { MD_Observable_Abstract_TaskBase } from "./MD_Observable_Abstract_TaskBase";

/**
 * TODO: Ein Task, der eine Markdown Datei schreibt.
 */
export class MD_Writer_Task<T extends string> extends MD_Observable_Abstract_TaskBase<T> implements Task_Interface<T> {

    perform(dao:Data_Interface<T>): Data_Interface<T> {
        dao = super.perform(dao);       
        return dao;
    }

    /**
     * Is called by super.perform()
     * @param mdfc 
     * @param index 
     * @param io_meta 
     * @returns 
     */
    protected transform(mdfc: MD_FileContent, index: number): MD_FileContent {
        return mdfc;
    }
}