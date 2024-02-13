import { MD_Exporter } from "../src/md-exporter";

const my_exporter: MD_Exporter = new MD_Exporter();
my_exporter.perform_job_from("./test/transport-config.json", "Example-Job No.1");