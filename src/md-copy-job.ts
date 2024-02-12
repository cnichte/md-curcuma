import { MD_Filesystem } from "./md-filesystem";
import { MD_Template } from "./md-template";
import {
  MD_CopyTask_Type,
  MD_Transformer_TemplateValues_Type,
} from "./md-transformer";

export class MD_CopyJob {
  /**
   *
   *
   * @static
   * @param {MD_CopyTask_Type} copy_task
   * @param {MD_Transformer_TemplateValues_Type} template_values
   * @memberof MD_CopyJob
   */
  static perform(
    copy_task: MD_CopyTask_Type,
    template_values: MD_Transformer_TemplateValues_Type,
  ): void {
    if (copy_task !== undefined && copy_task !== null) {
      // TODO Discovery: Should also search in Obsidian Vault subdirectories.
      // replace placeholders in path
      const source_path = copy_task.source.trim();
      const source_filename = template_values.name_full.trim();

      var target_path = copy_task.target.trim();
      const target_filename = template_values.name_full.trim();

      const source = MD_Filesystem.concat_path_filename(
        source_path,
        source_filename
      );

      const template: MD_Template = new MD_Template(target_path);
      target_path = template.fill(template_values);

      MD_Filesystem.ensure_path(target_path, copy_task.simulate);

      var target = MD_Filesystem.concat_path_filename(
        target_path,
        target_filename
      );

      if (MD_Filesystem.is_file_exist(source)) {
        if (source.length > 0 && target.length > 0) {
          MD_Filesystem.copy_file(source, target, copy_task.simulate);
        }
        {
          // console.log('copyjob: source or target missing!');
        }
      } else {
        console.log(`copyjob: source file doesnt exist '${source}' `);
      }
    } else {
      console.log("copyjob: no job defined.");
    }
  }
}
