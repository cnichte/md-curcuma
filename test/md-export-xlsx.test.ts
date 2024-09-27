import {
  XLSX_Mapper,
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

const map_1: XLSX_Mapper = {
  mapping_items: [
    {
      sheet_name: "Blatt 1",
      source_property_name: "C7", // Hallo Welt
      target_poperty_name: "data.prop1", // target nested props: "parent.child"
    },
  ],
};

const xlsx_transporter_parameter: XLSX_Transporter_Parameter_Type<JsonDoc> = {
  readPath: "test-data-xlsx/input/",
  writePath: "test-data-xlsx/output/",
  simulate: false,

  doSubfolders: false,
  limit: 1990,
  useCounter: false,

  mappings: [map_1],
  json_template: new JsonDoc(),
};

transporter.perform_job(xlsx_transporter_parameter);
