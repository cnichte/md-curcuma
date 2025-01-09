import { MD_InsertUUID_Mapping } from "../src/lib/mapping-tasks/md-insert-uuid-mapping";
import { MD_Mapping, MD_Mapping_Item } from "../src/lib/md-mapping";
import { MD_TRANSPORTER_COMMANDS } from "../src/lib/transporter/md-transporter";
import {
  XLSX_Mapping_Item,
  XLSX_Transporter,
  XLSX_Transporter_Parameter_Type,
} from "../src/lib/transporter/xlsx-transporter";

export interface DocIdentifiable {
  id: string;
}

export interface DocData {
  prop1: string;
  prop2: string;
}
export interface Doc extends DocIdentifiable {
  id: string;
  data: DocData;
}

class JsonDoc implements Doc {
  id: string = "";
  prop0: string = "";
  data: DocData = {
    prop1: "",
    prop2: "",
  };
}

/**
 * This test deals with reading and transforming XSLX Files.
 */
const transporter = new XLSX_Transporter<JsonDoc>();

const map_1: MD_Mapping<XLSX_Mapping_Item> = {
  mapping_items: [
    {
      sheet_name: "Blatt 1",
      source_property_name: "C7", // Hallo Welt
      target_poperty_name: "data.prop1", // target nested props: "parent.child"
    },
  ],
};

const insert_uuid: MD_Mapping<MD_Mapping_Item> = {
  task: new MD_InsertUUID_Mapping(),
  mapping_items: [
    {
      source_property_name: "_id",
      target_poperty_name: "_id",
    },
  ],
};

const xlsx_transporter_parameter: XLSX_Transporter_Parameter_Type<JsonDoc> = {
  readPath: "test-data_xlsx/input/",
  writePath: "test-data_xlsx/output/",
  simulate: false,

  doSubfolders: false,
  limit: 1990,
  useCounter: false,

  mappings: [map_1, insert_uuid],
  commands: [MD_TRANSPORTER_COMMANDS.DO_NOT_WRITE_FILES], // 
  json_template: new JsonDoc(),
  onPartialResult: function (result: JsonDoc): void {
    console.log("- onPartialResult-Callback --------------");
    console.log(JSON.stringify(result));
    console.log("-----------------------------------------");
  },
};

transporter.perform_job(xlsx_transporter_parameter);
