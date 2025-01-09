import { MD_Transporter } from "../src/lib/transporter/md-transporter";

/**
 * This test deals with the sharing of a longform document 
 * via a config file.
 */
const my_transporter: MD_Transporter = new MD_Transporter();
my_transporter.perform_job_from("test-data_obsidian-vault/transport-config.json", "Example-Job No.1");