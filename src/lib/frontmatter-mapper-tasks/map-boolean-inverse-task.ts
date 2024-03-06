import { MD_Frontmatter_MapTask } from "../md-frontmatter";

export class MD_Frontmatter_MapBooleanInverseTask
  implements MD_Frontmatter_MapTask
{
  perform(source_value: boolean, target_value: boolean): boolean {
    target_value = !source_value;
    return target_value;
  }
}
