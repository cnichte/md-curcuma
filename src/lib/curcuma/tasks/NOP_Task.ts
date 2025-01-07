import { Task_Interface } from "../types";

/**
 * Ein Task der nichts macht, ausser das Daten-Objekt durchreichen.
 */
export class NOP_Task<T> implements Task_Interface<T> {

    perform(dao:T): T {
        // console.log('NOP_Task', dao);
        return dao;
    }
}