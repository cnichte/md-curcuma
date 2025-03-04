import { Data_Interface, IO_Meta_Interface } from "../io/types";
import { Observable_Abstract_TaskBase } from "./Observable_Abstract_TaskBase";

/**
 * Ein Task der nichts macht, ausser das Daten-Objekt durchreichen.
 */
export class NOP_Task<T> extends Observable_Abstract_TaskBase<T> {
    perform(dao:Data_Interface<T>): Data_Interface<T> {
        console.log("NOP_Task.perform: ", dao);
        return dao;
    }

}