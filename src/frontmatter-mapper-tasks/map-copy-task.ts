import { MD_Frontmatter_MapTask } from "../md-frontmatter";

export class MD_Frontmatter_MapCopyTask implements MD_Frontmatter_MapTask {
  perform(source_value: string, target_value: string): string {
    target_value = source_value;
    return target_value;
  }
}
