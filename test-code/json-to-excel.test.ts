//! Teste: Das neue Curcuma
import { Runner } from "../src/lib/core";
import {
  Json_IO_Reader,
  Json_IO_ReadProps_Interface,
  XLSX_IO_WriteProps_Interface,
  XLSX_IO_Writer,
} from "../src/lib/io";
import { NOP_Task } from "../src/lib/tasks";

const runner = new Runner<string>();

// TODO process Arrays of folders
// TODO Schleuse den Type (über Task) ein aktiv, archiv, papierkorb
// TODO cleanup: erase target-file before first writing.
let r_props: Json_IO_ReadProps_Interface = {
  path: "test-data/json-to-excel/json/",
  simulate: false,
  doSubfolders: false,
  limit: 0,
  useCounter: false,
};

let w_props: XLSX_IO_WriteProps_Interface<string> = {
  path: "test-data/json-to-excel/excel/excel-output.xlsx",
  simulate: false,

  worksheet: "Sheet One",
  
  doSubfolders: false,
  limit: 0,
  useCounter: false,
  json_template: "",
};

runner.addReader(new Json_IO_Reader<string>(r_props));
runner.addTask(new NOP_Task<string>());
runner.addWriter(new XLSX_IO_Writer<string>(w_props));
runner.run();
