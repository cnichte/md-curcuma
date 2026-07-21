/**
 * This test deals with reading and transforming CSV File to JSON.
 * Downloading images from a web resource
 * updating the json with image path.
 */

import {
  Mapper_Interface,
  Runner,
} from "../src/lib/core";
import { CSV_IO_Reader, Json_IO_Writer } from "../src/lib/io";
import { Mapping_Task } from "../src/lib/tasks";

import {
  InsertUUID_Mapping,
  ArraySplit_Mapping,
  ImageDownloader_MappingType,
  ImageDownloader_Mapping,
} from "../src/lib/tasks/mappings";

const runner = new Runner<string>();

runner.addReader(
  new CSV_IO_Reader<string>({
    path: "test-data/csv-to-json/BookBuddy-test.csv",
    delimiter: ",", // Trennzeichen für Datensatz
    columns: true, // Erste Zeile als Header verwenden
    quote: '"', // Anführungszeichen für Felder
    relax_quotes: true, // Flexiblere Handhabung von Anführungszeichen
    skip_records_with_error: true, // Fehlerhafte Zeilen überspringen
    trim: true, // Whitespace trimmen
  })
);

runner.addWriter(
  new Json_IO_Writer<string>({
    path: "test-data/csv-to-json/books.json",
    simulate: false, // not implemented yet 
    append: true,
    doSubfolders: false, // not implemented yet 
    limit: 1000, // greift nur bei Verzeichnis
    useCounter: false, // not implemented yet 
  })
);

const insert_uuid: Mapper_Interface = {
  task: new InsertUUID_Mapping(),
  mapping_items: [
    {
      source_property_name: "",
      target_poperty_name: "UUID",
    },
  ],
};

const make_array: Mapper_Interface = {
  mapping_items: [
    { source_property_name: "Tags", target_poperty_name: "Tags" },
    { source_property_name: "Genre", target_poperty_name: "Genre" },
  ],
  task: new ArraySplit_Mapping({ separator: "," }),
};

let image_download_mapping_props: ImageDownloader_MappingType = {
  image_target_folder: "test-data/csv-to-json/images/",
  image_hugo_path: "",
  filename_property_name: "UUID",
  simulate: false,
};

const image_download_mapping: Mapper_Interface = {
  mapping_items: [
    {
      source_property_name: "Uploaded Image URL",
      target_poperty_name: "Cover_Image",
    },
  ],
  task: new ImageDownloader_Mapping(image_download_mapping_props),
};

runner.addTask(
  new Mapping_Task({
    mappings: [insert_uuid, make_array, image_download_mapping],
  })
);

// Todo: replace Task für Title: '\n' to ' - ' 
runner.run();