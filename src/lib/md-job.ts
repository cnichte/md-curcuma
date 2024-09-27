import { MD_Transporter_Parameter_Type } from './transporter/md-transporter';
import { MD_Transformer_Parameter_Type } from './md-transformer';

export interface MD_Job_Type {
    job_name:string;
    job_description:string;
    job_parameter: MD_Transporter_Parameter_Type;
    job_tasks: Array<MD_JobTasks_Type>;
}

export interface MD_JobTasks_Type {
    transformer_class_name: string;
    transformer_parameter:MD_Transformer_Parameter_Type;
}


export class Job_Manager {

    constructor(){

    }

    add_job(){

    }

    remove_job(){}


    add_job_tasks(){}

    remove_job_tasks(){}

    read_jobs(){

    }

    write_jobs(){

    }


}