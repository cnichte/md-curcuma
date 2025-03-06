//! Teste: Das neue Curcuma
import {
  Mapper_Interface,
  Mapper_Item_Interface,
  Runner,
} from "../src/lib/core";
import {
  Json_IO_Reader,
  Json_IO_ReadProps_Interface,
  XLSX_IO_WriteProps_Interface,
  XLSX_IO_Writer,
} from "../src/lib/io";
import {
  ArrayJoin_Mapping,
  Mapping_Task,
  Mapping_Task_Props,
  NOP_Task,
} from "../src/lib/tasks";

const runner = new Runner<any>();

// TODO process Arrays of folders
// TODO ? Schleuse den Type (über Task) ein aktiv, archiv, papierkorb ?
// TODO cleanup: erase target-file before first writing.

// getestet, läuft.
let r_props: Json_IO_ReadProps_Interface = {
  path: "test-data/json-to-excel/json/",
  simulate: false,
  doSubfolders: false,
  limit: 0,
  useCounter: false,
};

let w_props: XLSX_IO_WriteProps_Interface<any> = {
  path: "test-data/json-to-excel/excel/excel-output.xlsx",
  simulate: false,

  worksheet: "Sheet One",

  doSubfolders: false,
  limit: 0,
  useCounter: false,
  json_template: "",
};

let m1: Mapper_Interface = {
  mapping_items: [
    {
      source_property_name: "data_array_string",
      target_poperty_name: "data_array_string",
    },
  ],
  task: new ArrayJoin_Mapping({ separator: ", " }),
};

let m2: Mapper_Interface = {
  mapping_items: [
    {
      source_property_name: "protocol",
      target_poperty_name: "protocol",
    },
  ],
  task: new ArrayJoin_Mapping({ separator: "\n" }),
};

let mapping_task_props: Mapping_Task_Props = {
  mappings: [m1, m2],
};

runner.addReader(new Json_IO_Reader<any>(r_props));
runner.addTask(new Mapping_Task<any>(mapping_task_props));
runner.addWriter(new XLSX_IO_Writer<any>(w_props));
runner.run();
