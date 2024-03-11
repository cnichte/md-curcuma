import { CSV_Exporter, CSV_Exporter_Parameter_Type } from '../src/lib/csv-exporter';
import { MD_Mapping } from '../src/lib/md-mapping';
import { MD_ImageDownloader_Mapping, type MD_ImageDownloader_MappingType } from "../src/lib/mapping-tasks/md-image-downloader-mapping";
import { MD_InsertUUID_Mapping } from '../src/lib/mapping-tasks/md-insert-uuid-mapping';

/**
 * This test deals with reading and transforming CSV File to JSON.
 * Downloading images from a web resource
 * updating the json with image path.
 */
const insert_uuid: MD_Mapping = {
    source_property_name: "",
    target_poperty_name: "UUID",
    task: new MD_InsertUUID_Mapping(),
};

let image_download_mapping_props: MD_ImageDownloader_MappingType = {
    image_target_folder: "test-data-hugo/hugo-content-4/assets/images/",
    image_hugo_path: '',
    filename_property_name: "UUID",
    simulate: false,
};

const image_download_mapping: MD_Mapping = {
    source_property_name: "Uploaded_Image_URL",
    target_poperty_name: "Cover_Image",
    task: new MD_ImageDownloader_Mapping(image_download_mapping_props),
};

const csv_exporter_parameter: CSV_Exporter_Parameter_Type = {
    readPath: "test-data-obsidian-vault/attachments/bookbuddy-export.csv",
    writePath: "test-data-hugo/hugo-content-4/data/bookbuddy-export.json",
    csvSeparator: ',',
    mappings: [insert_uuid, image_download_mapping],
};

CSV_Exporter.transform_to_json(csv_exporter_parameter);