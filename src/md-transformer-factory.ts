import { MD_Frontmatter_Transformer } from "./transformer/md-frontmatter-task";
import { MD_ObsidianLink_Transformer } from "./transformer/md-obsidian-link-task";
import { MD_RemoveTODOS_Transformer } from "./transformer/md-remove-todos-task";
import { MD_Splitter_Transformer } from "./transformer/md-splitter-task";

/**
 * Create Instances from Class-Name-String.
 * All the Transformers have to be registered in the MD_Transformer_Registry.
 * 
 * TODO Das funktioniert so natürlich nicht für custom Transformers. 
 * Dann braucht man auch einen eigenen Loader, oder ich muss die hier hinzufügen können...
 * 
 * @export
 * @class MD_Transformer_Factory
 */
export class MD_Transformer_Factory {
    constructor(className: string, opts: any) {
        if (MD_Transformer_Registry[className] === undefined || MD_Transformer_Registry[className] === null) {
            throw new Error(`Class type of \'${className}\' is not in MD_Transformer_Registry`);
        }
        return new MD_Transformer_Registry[className](opts);
    }
  }
  
  // Register the Transformers her to create Instances from Class-Name-String.
  //  https://stackoverflow.com/questions/12710905/how-do-i-dynamically-assign-properties-to-an-object-in-typescript
  export const MD_Transformer_Registry: any = {
    MD_ObsidianLink_Transformer,
    MD_RemoveTODOS_Transformer,
    MD_Splitter_Transformer,
    MD_Frontmatter_Transformer
  }