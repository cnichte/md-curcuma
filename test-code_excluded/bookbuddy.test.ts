/**
 * This test deals with reading and transforming CSV File to JSON.
 * Downloading images from a web resource
 * updating the json with image path.
 */

import { Mapper_Interface, Mapper_Item_Interface, Runner } from "../src/lib/core";
import { CSV_IO, Json_IO } from "../src/lib/io";
import { Mapping_Task } from "../src/lib/tasks";

import { InsertUUID_Mapping, ArraySplit_Mapping, ImageDownloader_MappingType, ImageDownloader_Mapping  } from "../src/lib/tasks/mappings"

const runner = new Runner<string>();

runner.addReader(
  new CSV_IO<string>({
    readPath: "test-data/obsidian-vault/attachments/bookbuddy-export.csv",
    writePath: "",
    csvSeparator: ',',
  })
);

runner.addWriter(
    new Json_IO<string>({
        readPath: "",
        writePath: "test-data/hugo/hugo-content-4/data/bookbuddy-export.json", 
        simulate: false,
        doSubfolders: true,
        limit: 1000, // greift nur bei Verzeichnis
        useCounter: false
    })
  );

  const insert_uuid: Mapper_Interface<Mapper_Item_Interface> = {
    task: new InsertUUID_Mapping(),
    mapping_items: [{
        source_property_name: "",
        target_poperty_name: "UUID",
    }
    ]
};

const make_array: Mapper_Interface<Mapper_Item_Interface> = {
    mapping_items: [
        { source_property_name: "Tags", target_poperty_name: "Tags"}, 
        { source_property_name: "Genre", target_poperty_name: "Genre"}
    ],
    task: new ArraySplit_Mapping({ separator: "," }),
};

let image_download_mapping_props: ImageDownloader_MappingType = {
    image_target_folder: "test-data/hugo/hugo-content-4/assets/images/",
    image_hugo_path: '',
    filename_property_name: "UUID",
    simulate: false,
};

const image_download_mapping: Mapper_Interface<Mapper_Item_Interface> = {
    mapping_items: [{
        source_property_name: "Uploaded_Image_URL",
        target_poperty_name: "Cover_Image",
    }],
    task: new ImageDownloader_Mapping(image_download_mapping_props),
};


runner.addTask(new Mapping_Task({
    mappings: [insert_uuid, make_array, image_download_mapping]
}));

runner.run();



/*
const insert_uuid: MD_Mapping<MD_Mapping_Item> = {
    task: new InsertUUID_Mapping(),
    mapping_items: [{
        source_property_name: "",
        target_poperty_name: "UUID",
    }
    ]
};

const make_array: MD_Mapping<MD_Mapping_Item> = {
    mapping_items: [
        { source_property_name: "Tags", target_poperty_name: "Tags"}, 
        { source_property_name: "Genre", target_poperty_name: "Genre"}
    ],
    task: new ArraySplit_Mapping({ separator: "," }),
};

let image_download_mapping_props: ImageDownloader_MappingType = {
    image_target_folder: "test-data/hugo/hugo-content-4/assets/images/",
    image_hugo_path: '',
    filename_property_name: "UUID",
    simulate: false,
};

const image_download_mapping: Mapping<MD_Mapping_Item> = {
    mapping_items: [{
        source_property_name: "Uploaded_Image_URL",
        target_poperty_name: "Cover_Image",
    }],
    task: new ImageDownloader_Mapping(image_download_mapping_props),
};

const csv_exporter_parameter: CSV_Transporter_Parameter_Type = {
    readPath: "test-data/obsidian-vault/attachments/bookbuddy-export.csv",
    writePath: "test-data/hugo/hugo-content-4/data/bookbuddy-export.json",
    csvSeparator: ',',
    mappings: [insert_uuid, make_array]
}; // image_download_mapping


CSV_Transporter.transform_to_json(csv_exporter_parameter);
*/