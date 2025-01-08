import { BLC_Parameter, Broken_Link_Checker } from "../src/lib/broken-link-checker";

// const url = 'http://localhost:1313/';
const url: string = 'http://192.168.178.91:81';

let external_links: BLC_Parameter = new BLC_Parameter();

external_links.scan_source = url;
external_links.write_to = 'test-data-links-check/external.json';
external_links.mode = 'extern';
Broken_Link_Checker.run(external_links);

let internal_links: BLC_Parameter = new BLC_Parameter();
internal_links.scan_source = url;
internal_links.write_to = 'test-data-links-check/internal.json';
internal_links.mode = 'intern';
Broken_Link_Checker.run(internal_links);

//! or
// Broken_Link_Checker.run([external_links, internal_links]);

