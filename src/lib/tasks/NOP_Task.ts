import { DAO_Interface, IO_Meta_Interface } from "../io/types";
import { Observable_Abstract_TaskBase } from "./Observable_Abstract_TaskBase";

/**
 * Ein Task der nichts macht, ausser das Daten-Objekt durchreichen.
 */
export class NOP_Task<T> extends Observable_Abstract_TaskBase<T> {
    perform(dao:DAO_Interface<T>): DAO_Interface<T> {
        return dao;
    }

}