
import { Mapper, Mapper_Interface, Mapper_Item_Interface } from "../core/mapper";
import { IO_Meta_Interface } from "../io/types";
import { Observable_Abstract_TaskBase } from "./Observable_Abstract_TaskBase";


export interface Mapping_Task_Props {
    mappings?: Mapper_Interface<Mapper_Item_Interface>[];
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
    perform(dao: T, io_meta: IO_Meta_Interface): T {

        if (this.props.hasOwnProperty("mappings")) {
            let mapper = new Mapper<Mapper_Item_Interface>();
            mapper.addMappings(this.props.mappings);
            mapper.do_mappings(dao, dao); // TODO geht das????
          }

        return dao;
    }

}