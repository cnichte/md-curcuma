import { MD_Exporter } from "../src/lib/md-exporter";

/**
 * This test deals with the sharing of a longform document 
 * via a config file.
 */
const my_exporter: MD_Exporter = new MD_Exporter();
my_exporter.perform_job_from("test-data-obsidian-vault/transport-config.json", "Example-Job No.1");