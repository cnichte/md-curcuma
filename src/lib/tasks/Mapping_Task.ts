
import { Mapper, Mapper_Interface } from "../core/mapper";
import { Data_Interface } from "../io/types";
import { Observable_Abstract_TaskBase } from "./Observable_Abstract_TaskBase";


export interface Mapping_Task_Props {
    mappings?: Mapper_Interface[];
}

/**
 * 
 */
export class Mapping_Task<T> extends Observable_Abstract_TaskBase<T> {

    props:Mapping_Task_Props

    constructor(props:Mapping_Task_Props){
        super();
        this.props = props;
    }    
    perform(dao:Data_Interface<T>): Data_Interface<T> {

        if (this.props.hasOwnProperty("mappings")) {
            let mapper = new Mapper();
            mapper.addMappings(this.props.mappings);
            mapper.do_mappings(dao, dao); // TODO geht das????
          }

        return dao;
    }

}