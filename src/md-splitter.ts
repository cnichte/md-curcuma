import { MD_Collection, type MD_Collection_Parameter } from "./md-collection";
import { MD_Frontmatter } from "./md-frontmatter";
import { MD_Transformer } from "./md-transformer";
var fs = require("fs");

/**
 * MD_Splitter splits a long Markdown document into several individual documents at defined headlines.
 * Performs transformations on the content as required.
 * 
 * @author Carsten Nichte - 2024
 */

/**
 * Defines the parameters of MD_Splitter.
 *
 * @export
 * @interface MD_Splitter_Parameter
 */
export interface MD_Splitter_Parameter {
  readPath: string;
  writePath: string;
  pattern: string;
  cleanName: string;
  limit: number;
  hasCounter: boolean;
  weightBase: number;
  url_prefix: string;
  doRemoveHeadline: boolean;
  frontmatter:MD_Frontmatter;
}

/**
 * The Splitter itself.
 *
 * @export
 * @class MD_Splitter
 */
export class MD_Splitter {
  private transformers: Array<MD_Transformer> = [];

  /**
   * Register a Transformer.
   *
   * @param {MD_Transformer} t
   * @memberof MD_Splitter
   */
  public addTransformer(t: MD_Transformer): void {
    this.transformers.push(t);
  }

  /**
   * Split my Obsidian Longform into separate files für Hugo.
   *
   * @param {MD_Splitter_Parameter} parameter
   * @memberof MD_Splitter
   */
  public split_longform(parameter: MD_Splitter_Parameter): void {
    var counter = 0;

    try {
      var longform_array = fs
        .readFileSync(parameter.readPath)
        .toString()
        .split("\n");
    } catch (err) {
      throw err;
    }

    let collection: MD_Collection | null | undefined = null;

    for (var i = 0; i < longform_array.length; i++) {
      //
      // Record change...
      // Found a heading to split up
      // Potential content before the first headline gets lost.
      // But my longform documents always start with a # headline.
      if (longform_array[i].indexOf(parameter.pattern) == 0) {
        counter = counter + 1;

        if (typeof parameter.limit != "undefined" && counter > parameter.limit)
          break;

        if (collection !== null) {
          collection.write_file(parameter.writePath);
        }

        let params:MD_Collection_Parameter = {
          split_row: longform_array[i],
          cleanName: parameter.cleanName,
          url_prefix: parameter.url_prefix,
          frontmatter:parameter.frontmatter,
          useCounter: parameter.hasCounter,
          counter: counter,
        }

        collection = new MD_Collection(params);

        // remove the Headline itself, because it is now in frontmatter.
        // 2nd parameter means remove one item only
        if (parameter.doRemoveHeadline) longform_array.splice(i, 1);

      } else {
        if (collection !== null) {
          for (let transformer of this.transformers) {
            transformer.transform(longform_array, i);
          }

          collection.add_content(longform_array[i]);
        }
      }
    }

    // handle last file
    if (collection !== null) {
      collection.write_file(parameter.writePath);
    }
  }
}