import * as fs from "fs";
import * as path from "path";
import * as fsextra from "fs-extra";
import * as XLSX from "xlsx";
import { IOable } from "../io/types";

/**
 * Some handy Filesystem stuff from https://nodejs.org/api/fs.html
 *
 * @export
 * @class Filesystem
 */ export class Filesystem {

  /**
   * TODO filter https://github.com/jprichardson/node-fs-extra/blob/master/docs/copy-sync.md
   *
   * @static
   * @param {string} source
   * @param {string} target
   * @param {boolean} [simulate=false]
   * @memberof Filesystem
   */
  static copy_file(source: string, target: string, simulate: boolean = false) {
    if (!simulate) {
      if (Filesystem.is_file_exist(source)) {
        if (Filesystem.is_file_exist(target)) {
          if (Filesystem.is_file_modified(source, target)) {
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
      if (Filesystem.is_file_exist(source)) {
        console.log(`source exist: ${source}.`);
      } else {
        console.log(`source exist not: ${source}.`);
      }
      if (Filesystem.is_file_exist(target)) {
        console.log(`target exist: ${target}.`);
      } else {
        console.log(`target exist not: ${target}.`);
      }
      if (Filesystem.is_file_modified(source, target)) {
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
    const ctime_source = stats_source.ctime;

    const stats_target = fs.statSync(file_target);
    const mtime_target = stats_target.mtime;
    const ctime_target = stats_target.ctime;
    console.log(`File source: ${file_source}, target: ${file_target}`);
    console.log(
      `File data last modified, source: ${mtime_source}, target: ${mtime_target}`
    );
    console.log(
      `File data last created, source: ${ctime_source}, target: ${ctime_target}`
    );

    return mtime_source.getTime() !== ctime_source.getTime();
  }

  /**
   * Get information about a file.
   * 
   * https://nodejs.org/api/fs.html#fsfstatsyncfd-options
   * https://nodejs.org/api/fs.html#class-fsstats
   * 
   * @param file 
   * @returns 
   */
  public static get_file_info(
    file: string,
  ): fs.Stats {
    return fs.statSync(file);
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
   * @memberof Filesystem
   */
  static ensure_path(my_path: string, simulate: boolean = false) {
    if (!simulate) {
      fsextra.ensureDirSync(my_path);
      console.log(`ensure_path exist: '${my_path}'`);
    } else {
      const folder_arr = Filesystem.get_path_parts(my_path);
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
   * @memberof Filesystem
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
   * @memberof Filesystem
   */
  public static get_path_depth(my_path: string): number {
    return Filesystem.get_path_parts(my_path).length;
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

  public static read_file_txt(file: string): string {
    try {
      var md_array: string = fs.readFileSync(file).toString();
    } catch (err) {
      throw err;
    }

    return md_array;
  }

  public static read_file_xlsx(file: string): XLSX.WorkBook {
    let wb: XLSX.WorkBook = null;

    try {
      wb = XLSX.read(fs.readFileSync(file, "binary"), {
        type: "binary",
      });
    } catch (err) {
      throw err;
    }

    return wb;
  }

  public static write_file_xlsx(
    writePath: string,
    content: XLSX.WorkBook
  ): void {
    try {
      console.log(`Write XLSX File ${writePath}`);
      XLSX.writeFile(content, writePath, { compression: true });
    } catch (error) {
      console.log(`An error has occurred, writing ${writePath}`, error);
    }
  }

  public static write_file_txt(writePath: string, content: string): void {
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

  /**
   * Does all the nasty filesystem-checking, before writing.
   * 
   * - simulation mode (does not write to filesystem anyway)
   * - extra surpress filesystem writing.
   * - does file exist?
   * - is souce-file modified, compared to target-file?
   * 
   * @param source_file
   * @param job_parameter
   * @param workbook
   * @param do_not_write_file
   * @param doWriting - callback
   */
  public static write_my_file<T, P extends IOable>(
    source_file: string,
    job_parameter: P,
    workbook: T,
    do_not_write_file: boolean,
    doWriting?: (filename: string, data: T) => void
  ) {
    const filename = Filesystem.get_filename_from(source_file);

    const path_target_filename = Filesystem.concat_path_filename(
      job_parameter.path,
      filename
    );

    Filesystem.ensure_path(job_parameter.path, job_parameter.simulate); // TODO that doesn't always work?

    if (!job_parameter.simulate) {
      // Here, of course, the option of forcing the disk can be useful.
      if (!do_not_write_file) {
        if (Filesystem.is_file_exist(path_target_filename)) {
          if (
            Filesystem.is_file_modified(source_file, path_target_filename)
          ) {
            console.log(
              "file does exist, and is modified (compared by modified-date): Write it."
            );
            doWriting(path_target_filename, workbook);
          } else {
            console.log("file does exist, but is not modified: Skip writing.");
          }
        } else {
          console.log("file does not exist: Write it.");
          doWriting(path_target_filename, workbook);
        }
      }
    } else {
      console.log("###########################");
      console.log(source_file);
      console.log(path_target_filename);
      console.log(
        `modified:  ${Filesystem.is_file_modified(
          source_file,
          path_target_filename
        )}`
      );
      console.log("###########################");
    }
  }
}
