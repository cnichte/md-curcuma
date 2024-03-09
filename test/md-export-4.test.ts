import { MD_Tools } from '../src/lib/md-tools';

MD_Tools.csv_to_json("test/bookbuddy-export.csv","test/bookbuddy-export.json");
MD_Tools.download_all_images_from_json("test/bookbuddy-export.json", "test/hugo-content-4", "Uploaded_Image_URL");