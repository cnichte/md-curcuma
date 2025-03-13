//! Teste: Das neue Curcuma
import { Mapper_Interface, Mapper_Properties, Runner } from "../src/lib/core";
import {
  Json_IO_Reader,
  Json_IO_ReadProps_Interface,
  Json_IO_WriteProps_Interface,
  Json_IO_Writer,
  XLSX_IO_Reader,
  XLSX_IO_ReadProps_Interface,
  XLSX_IO_WriteProps_Interface,
  XLSX_IO_Writer,
} from "../src/lib/io";
import {
  ArrayJoin_Mapping,
  Mapping_Task,
  Mapping_Task_Props,
  NOP_Task,
  Xlsx_Anlayse_Task,
  Xlsx_Anlayse_Task_Props,
} from "../src/lib/tasks";

const runner = new Runner<any>();

// TODO process Arrays of folders
// TODO cleanup: erase target-file before first writing.

// getestet, läuft.
const reader_props: XLSX_IO_ReadProps_Interface<any> = {
  path: "test-data/excel-to-json/test.xlsx",

  worksheet: "",
  json_template: undefined,

  simulate: false,
  doSubfolders: false,
  limit: 0,
  useCounter: false,
};

const writer_props: Json_IO_WriteProps_Interface = {
  path: "test-data/excel-to-json/json/test.json",
  simulate: false,

  doSubfolders: false, // TODO implement
  limit: 0, // TODO implement
  useCounter: false, // TODO implement
};

runner.addReader(new XLSX_IO_Reader<any>(reader_props));

// Analyzes the XLSX-Json Object to get the coordinates of the content.
// That should help you to setup the mapping.
runner.addTask(new Xlsx_Anlayse_Task({ write_path: "test-data/excel-to-json/test.xlsx.analyse.txt",}));

runner.addWriter(new Json_IO_Writer<any>(writer_props));
runner.run();
