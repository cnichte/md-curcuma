import * as fs from "fs";
import * as path from "path";
import * as fsextra from "fs-extra";

// TODO https://github.com/jxson/front-matter
var fm = require("front-matter");
// TODO https://eemeli.org/yaml/#yaml
import { stringify } from "yaml";

/**
 * Frontmatter is separated from the rest of the text for easier processing.
 *
 * content.attributes - contains the extracted yaml attributes in json form
 * content.body - contains the string contents below the yaml separators
 * content.bodyBegin - contains the line number the body contents begins at
 * content.frontmatter - contains the original yaml string contents
 * @export
 * @interface MD_FileContent_Interface
 */
export interface MD_FileContent_Interface {
  frontmatter: string;
  frontmatter_attributes: any;
  body_array: string[];
  index:number;
}

/**
 * Some handy Filesystem stuff from https://nodejs.org/api/fs.html
 *
 * @export
 * @class MD_Filesystem
 */ export class MD_Filesystem {
  /**
   * Split a file in frontmatter and content-body.
   *
   * @static
   * @param {string} content
   * @return {*}  {MD_FileContent_Interface}
   * @memberof MD_Filesystem
   */
  public static split_frontmatter_body(
    content: string
  ): MD_FileContent_Interface {
    const fm_content = fm(content);

    const file_content: MD_FileContent_Interface = {
      frontmatter: fm_content.frontmatter,
      frontmatter_attributes: fm_content.attributes,
      body_array: fm_content.body.split("\n"),
      index: 0
    };
    return file_content;
  }

  /**
   * Merge frontmatter and content-body into a file-content.
   *
   * @static
   * @param {MD_FileContent_Interface} mdfc
   * @return {*}  {string}
   * @memberof MD_Filesystem
   */
  public static merge_frontmatter_body(mdfc: MD_FileContent_Interface): string {
    mdfc.frontmatter = stringify(mdfc.frontmatter_attributes);
    return (
      "---\n" + mdfc.frontmatter + "\n---\n\n" + mdfc.body_array.join("\n")
    );
  }

  /**
   * TODO filter https://github.com/jprichardson/node-fs-extra/blob/master/docs/copy-sync.md
   *
   * @static
   * @param {string} source
   * @param {string} target
   * @param {boolean} [simulate=false]
   * @memberof MD_Filesystem
   */
  static copy_file(source: string, target: string, simulate: boolean = false) {
    if (!simulate) {
      if (MD_Filesystem.is_file_exist(source)) {
        if (MD_Filesystem.is_file_exist(target)) {
          if (MD_Filesystem.is_file_modified(source, target)) {
            fsextra.copySync(source, target);
            console.log(`copy_file from ${source} to ${target}`);
          } else {
            console.log(`copyjob: source file not modified '${source}'`);
          }
        } else {
          fsextra.copySync(source, target);
          console.log(`copy_file from ${source} to ${target}`);
        }
      } else {
        console.log(`copyjob: source file doesnt exist '${source}'`);
      }
    } else {
      console.log(`copy_file (simulated) from ${source} to ${target}`);
      if (MD_Filesystem.is_file_exist(source)) {
        console.log(`source exist: ${source}.`);
      } else {
        console.log(`source exist not: ${source}.`);
      }
      if (MD_Filesystem.is_file_exist(target)) {
        console.log(`target exist: ${target}.`);
      } else {
        console.log(`target exist not: ${target}.`);
      }
      if (MD_Filesystem.is_file_modified(source, target)) {
        console.log(`source is modified: ${target}.`);
      } else {
        console.log(`source not modified: ${target}.`);
      }
    }
  }

  public static isFolder(my_path: string): boolean {
    // Verzeichnis, oder einzelne Datei?
    try {
      var stat = fs.lstatSync(my_path);
      return stat.isDirectory();
    } catch (e) {
      // lstatSync throws an error if path doesn't exist
      return false;
    }
  }

  public static isFile(my_path: string): boolean {
    // Verzeichnis, oder einzelne Datei?
    try {
      var stat = fs.lstatSync(my_path);
      return stat.isFile();
    } catch (e) {
      // lstatSync throws an error if path doesn't exist
      return false;
    }
  }

  public static is_file_exist(my_path: string): boolean {
    if (fs.existsSync(my_path)) {
      return true;
    } else {
      return false;
    }
  }

  public static is_file_modified(
    file_source: string,
    file_target: string
  ): boolean {
    const stats_source = fs.statSync(file_source);
    const mtime_source = stats_source.mtime;

    const stats_target = fs.statSync(file_target);
    const mtime_target = stats_target.mtime;

    console.log(
      `File data last modified, source: ${mtime_source}, target: ${mtime_target}`
    );

    return mtime_source === mtime_target;
  }

  public static get_filename_from(my_path_filename: string): string {
    return path.basename(my_path_filename);
  }

  public static get_path_from(my_path_filename: string): string {
    return path.parse(my_path_filename).dir;
  }

  public static concat_path_filename(
    my_path: string,
    my_filename: string
  ): string {
    if (my_path.endsWith(path.sep)) {
      return my_path + my_filename;
    } else {
      return my_path + path.sep + my_filename;
    }
  }

  /**
   * Ensures that the path exists.
   * It is created if it does not exist.
   *
   * @static
   * @param {string} my_path
   * @param {boolean} [simulate=false]
   * @memberof MD_Filesystem
   */
  static ensure_path(my_path: string, simulate: boolean = false) {
    if (!simulate) {
      fsextra.ensureDirSync(my_path);
      console.log(`ensure_path exist: '${my_path}'`);
    } else {
      const folder_arr = MD_Filesystem.get_path_parts(my_path);
      console.log(`ensure_path (simulated): '${my_path}'`);
      console.log("ensure_path (simulated):", folder_arr);

      var part: string = "";

      for (const folder of folder_arr) {
        part = (part === "" ? "" : part + path.sep) + folder;
        if (folder !== "") {
          if (!fs.existsSync(part)) {
            console.log(`ensure_path (simulated): missing: '${part}'`);
          } else {
            console.log(`ensure_path (simulated):  exists: '${part}'`);
          }
        }
      }
    }
  }

  /**
   * Windows: [ 'C:', 'projects', 'folder-2', 'index.js' ]
   *
   * @static
   * @param {string} my_path
   * @return {*}  {string[]}
   * @memberof MD_Filesystem
   */
  public static get_path_parts(my_path: string): string[] {
    return my_path.split(path.sep);
  }

  /**
   *
   *
   * @static
   * @param {string} my_path
   * @return {*}  {number}
   * @memberof MD_Filesystem
   */
  public static get_path_depth(my_path: string): number {
    return MD_Filesystem.get_path_parts(my_path).length;
  }

  public static get_files_list(
    dir: string,
    files: Array<string> = []
  ): Array<string> {
    // Get an array of all files and directories in the passed directory using fs.readdirSync
    const fileList: fs.Dirent[] = fs.readdirSync(dir, { withFileTypes: true }); // has a recursive: true
    // Create the full path of the file/directory by concatenating the passed directory and file/directory name
    for (const file of fileList) {
      const name = `${dir}/${file.name}`;
      // Check if the current file/directory is a directory using fs.statSync
      if (fs.statSync(name).isDirectory()) {
        // If it is a directory, recursively call the getFiles function with the directory path and the files array
        this.get_files_list(name, files);
      } else {
        // If it is a file, push the full path to the files array
        files.push(name);
      }
    }
    return files;
  }

  public static read_file(file: string): string {
    try {
      var md_array: string = fs.readFileSync(file).toString();
    } catch (err) {
      throw err;
    }

    return md_array;
  }

  public static write_file(writePath: string, content: string): void {
    // path + filename;

    try {
      console.log(`Write File ${writePath}`);
      fs.writeFileSync(writePath, content, "utf8");
    } catch (error) {
      console.log(`An error has occurred, writing ${writePath}`, error);
    }
  }

  public static read_file_json(file: string): any {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  }

  public static write_file_json(file: string, json_object: any): void {
    // if (fs.existsSync(a_path)) { // Do something }
    fs.writeFileSync(file, JSON.stringify(json_object));
  }
}
