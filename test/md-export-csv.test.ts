import { CSV_Transporter, CSV_Transporter_Parameter_Type } from '../src/lib/transporter/csv-transporter';
import { MD_Mapping, MD_Mapping_Item } from '../src/lib/md-mapping';
import { MD_ImageDownloader_Mapping, type MD_ImageDownloader_MappingType } from "../src/lib/mapping-tasks/md-image-downloader-mapping";
import { MD_InsertUUID_Mapping } from '../src/lib/mapping-tasks/md-insert-uuid-mapping';
import { MD_ArraySplit_Mapping } from '../src/lib/mapping-tasks/md-arraysplit-mapping'
/**
 * This test deals with reading and transforming CSV File to JSON.
 * Downloading images from a web resource
 * updating the json with image path.
 */
const insert_uuid: MD_Mapping<MD_Mapping_Item> = {
    task: new MD_InsertUUID_Mapping(),
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
    task: new MD_ArraySplit_Mapping({ separator: "," }),
};

let image_download_mapping_props: MD_ImageDownloader_MappingType = {
    image_target_folder: "test-data-hugo/hugo-content-4/assets/images/",
    image_hugo_path: '',
    filename_property_name: "UUID",
    simulate: false,
};

const image_download_mapping: MD_Mapping<MD_Mapping_Item> = {
    mapping_items: [{
        source_property_name: "Uploaded_Image_URL",
        target_poperty_name: "Cover_Image",
    }],
    task: new MD_ImageDownloader_Mapping(image_download_mapping_props),
};

const csv_exporter_parameter: CSV_Transporter_Parameter_Type = {
    readPath: "test-data-obsidian-vault/attachments/bookbuddy-export.csv",
    writePath: "test-data-hugo/hugo-content-4/data/bookbuddy-export.json",
    csvSeparator: ',',
    mappings: [insert_uuid, make_array]
}; // image_download_mapping

CSV_Transporter.transform_to_json(csv_exporter_parameter);