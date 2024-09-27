import {
    XLSX_Transporter,
    XLSX_Transporter_Parameter_Type,
  } from "../src/lib/transporter/xlsx-transporter";

/**
 * This test deals with reading and transforming XSLX Files.
 */
const transporter: XLSX_Transporter = new XLSX_Transporter();

const simulate_job = false;
const simulate_copy_job = false;

const xlsx_transporter_parameter: XLSX_Transporter_Parameter_Type = {
    readPath: "test-data-xlsx/input/",
    writePath: "test-data-xlsx/output/",
    doSubfolders: false,
    limit: 1990,
    useCounter: false,
    simulate: simulate_job,
  };


  transporter.perform_job(xlsx_transporter_parameter);