import { Filesystem } from "./filesystem";
import { MD_LinkTransformer_TemplateValues_Type } from "./tasks/markdown";
import { MD_Template } from "./tasks/markdown/helpers/MD_Template";
import { MD_CopyTask_Type } from "./types";

export class MD_CopyJob {
  /**
   *
   *
   * @static
   * @param {MD_CopyTask_Type} copy_task
   * @param {MD_LinkTransformer_TemplateValues_Type} template_values
   * @memberof MD_CopyJob
   */
  static perform(
    copy_task: MD_CopyTask_Type, // TODO Den gibt es doppelt
    template_values: MD_LinkTransformer_TemplateValues_Type // TODO Den gibt es doppelt
  ): void {
    if (copy_task !== undefined && copy_task !== null) {
      // TODO Discovery: Should also search in Obsidian Vault subdirectories.
      // replace placeholders in path
      const source_path = copy_task.source.trim();
      const source_filename = template_values.name_full.trim();

      var target_path = copy_task.target.trim();
      const target_filename = template_values.name_full.trim();

      const source = Filesystem.concat_path_filename(
        source_path,
        source_filename
      );

      const template: MD_Template = new MD_Template(target_path);
      target_path = template.fill(template_values);

      Filesystem.ensure_path(target_path, copy_task.simulate);

      var target = Filesystem.concat_path_filename(
        target_path,
        target_filename
      );
      
      // if source exist, and is modified.
      Filesystem.copy_file(source, target, copy_task.simulate);

    } else {
      console.log("copy_task: ist not defined.");
    }
  }

  public static hasCopyTask(obj: any):boolean{
    if(obj.copy_task === undefined || obj.copy_task === null){
      return false;
    } else return true;
  }

  public static toString(obj:any): string {
      if(MD_CopyJob.hasCopyTask(obj)){
        return `simulate:${obj.copy_task.simulate}, source:'${obj.copy_task.source}', target:'${obj.copy_task.target}'`;
      }else{
        return "no copy_task defined."; 
      }
  }
}
