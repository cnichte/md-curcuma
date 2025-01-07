import { Markdown_IO } from "../io";
import { Task_Interface } from "../types";

/**
 * TODO: Schreibt eine Markdown Datei.
 */
export class MD_Writer_Task<T> implements Task_Interface<T> {

    perform(dao:T): T {

        console.log('MD_Writer_Task', dao);

        // const md_io = new Markdown_IO();
        // md_io.write(dao);
        
        return dao;
    }
}