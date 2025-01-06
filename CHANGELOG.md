# Release History

## Unresolved issues & planned features

1. A filter for the filereader to exclude some files and folders. Keyword: globbing patterns.
2. preserve folder structure.
3. Transformations on the target filename.
4. Run a joblist in batch.
5. Implement job-propertys functions: doSubfolders, limit, useCounter.
6. Process multiple source-target pairs in one mapping...
7. Make individual Markdown-Documents from each data record of the CSV-file.

and on the top of it

* Nice Graphical-User-Interface...
  * as Obsidian-Plugin
  * or as standalone App
  * or as fancy integration into [one of these frontends](https://gohugo.io/tools/front-ends/)

What has been implemented so far:

## Release 1.2.16 (2025-01-06)

* A Broken Link Checker for Hugo (but not only for Hugo)
* Added some experimental stuff for EXIF and XLSX Support.
* All dependencies updated to the latest package versions
* Typescript Target is now ES6

## Release 1.2.15 (2024-06-16)

## Release 1.2.14 (2024-04-11)

* Some reorganisation:
  * `MD_Exporter` is now `MD_Transporter`
  * `CSV_Exporter` is now `CSV_Transporter`
* Manual revised
* All dependencies updated to the latest package versions

## Release 1.2.13 (2024-03-14)

* `MD_ArraySplit_Mapping` returns always an array - Which is what you would expect.
* Did some Documentation.

## Release 1.2.12 (2024-03-14)

* Fixed the Doku
* `longform-markdown-splitter` becomes now finaly `md-curcuma`. The project has had the name for some time, and I have now also adapted the addresses:
  * Gitlab
    * old : [github.com/cnichte/longform-markdown-splitter](https://github.com/cnichte/longform-markdown-splitter)
    * new: [github.com/cnichte/md-curcuma](https://github.com/cnichte/md-curcuma)
  * NPM
    * old: [npmjs.com/package/longform-markdown-splitter](https://www.npmjs.com/package/longform-markdown-splitter)
    * new : [npmjs.com/package/md-curcuma](https://www.npmjs.com/package/md-curcuma)

## Release 1.2.11 (2024-03-14)

Apply one Mapping Task on multiple pairs of Fields.

Previously Rule: One mapping task, one field. Which means a mapping could only be applied to one pair of fields. You had to write down two mappings to achieve this:

```ts
// the old ones, shall be dropped.
const mapping_1: MD_Mapping = {
    source_property_name: "Tags",
    target_poperty_name: "Tags",
    task: new MD_ArraySplit_Mapping({ separator: "," }),
};

const mapping_2: MD_Mapping = {
    source_property_name: "Genre",
    target_poperty_name: "Genre",
    task: new MD_ArraySplit_Mapping({ separator: "," }),
};
```

That no longer applies.

The New Rule is: One mapping task, multiple pairs of fields. The property `mapping_items` is a List of `MD_Mapping_Item`:

```ts
const make_array: MD_Mapping = {
    mapping_items: [
        { source_property_name: "Tags", target_poperty_name: "Tags" },
        { source_property_name: "Genre", target_poperty_name: "Genre" },
    ],
    task: new MD_ArraySplit_Mapping({ separator: "," }),
};
```

## Release 1.2.10 (2024-03-13)

* `MD_InsertUUID_Mapping` no longer always returns a new uuid, but only if there is no valid uui in the field.

## Release 1.2.9 (2024-03-12)

* For MD_Splitter_Parameter_Type, the `weightBase` parameter was not passed through.

## Release 1.2.8 (2024-03-12)

* Some optimations in CSV_Exporter.
* New Mapper: MD_ArrayJoin_Mapping, MD_ArraySplit_Mapping, MD_TrimString_Mapping.
* As always: Did some Documentation

## Release 1.2.7 (2024-03-12)

* If `Uploaded_Image_URL` == "" must result in `Cover_Image` = "", and not in the `image_hugo_path`.
* Hugo doest support paths when getzing a single image.

## Release 1.2.6 (2024-03-12)

* lost the uuid package.
* Dokumentation fixed.

## Release 1.2.5 (2024-03-12)

* Improvements on the Mapper
  * With more information comes more responsibility.
  * Previously, the MappingTask only received the values from source-object and target-object, and returned the target-value.
  * Moreover, a MapperTask was blind to his surroundings.
  * The assignments were carried out by the calling MD_Mapper.
  * Now a MapperTask has also access to the whole objects, and the property-names.
  * This gives more flexibility when processing the data.
* `MD_Tools` is now `CSV_Exporter` and
* `MD_Tools.csv_to_json` is now `CSV_Exporter.transform_to_json`
* I have reorganized the test cases:
  * `/test/` -  Only the test scripts `*.test.ts` are still here. The rest of the folders and files can be deleted from this directory.
  * `/test-data-hugo/` - The target directory for the generated Hugo content. The content can be safely deleted.
  * `test-data-obsidian-vault` - The source directory from which the content is generated. It would be better not to delete anything here.
* Some new Build-Scripts
  * clean the `test-data-hugo` folder with `npm run clean:test`.
  * clean the `dist`folder with `npm run clean:dist`.
  * clean both folders with `npm run clean`.

## Release 1.2.1 to 1.2.4 (2024-03-09)

* index was missing, sorry.
* fixed some wrong paths.

## Release 1.2.0 (2024-03-09)

* introducing MD_Tool: parse CSV to JSON, and download the images from url.
  * The [BookBuddy App](https://www.kimicoapps.com/bookbuddy) exports its contents as a csv file.
  * I would like to use the data in Hugo.
  * To do this, I convert the csv to json and download the also exported images from URL.

## Release 1.1.2 (2024-03-08)

* fixed the documentation

## Release 1.1.1 (2024-03-08)

* Introducing the Mapper
* Did some documentation

## Release 1.1.0 (2024-03-08)

* Support Inline Latex-Formula.
* Translate Callouts from Obsidian-Markdown to Hugo-Callout-Shortcode.

## Release 1.0.17 (2024-03-06)

* Adding and removing Items to the Markdown-Content Array is now better considered.
* `MD_Math_Transformer` Task to transform Transform Latex Formula Parapgraphs from Obsidian-Style to Hugo-Style...

## Release 1.0.16 (2024-03-04)

* Wrong export fixed

## Release 1.0.15 (2024-02-16)

Splitting a single large file already works fine, but I'm still working on case three: copying various individual files and mapping from the frontmatter of the source file to the target file. It's not working properly yet, but it's slowly getting better.

## Release 1.0.14 (2024-02-14)

* `copy_task` sadly didnt copy anything for some reasons. I fixed that.

## Release 1.0.13 (2024-02-14)

* There was an Exception when no `copy_task` was defined. This no longer happens.

## Release 1.0.12 (2024-02-13)

## Release 1.0.11 (2024-02-13)

* updated READ_ME.md

## Release 1.0.10 (2024-02-13)

## Release 1.0.9 (2024-02-13)

* Another Argh! Update.
* Types (d.ts) missing.
* fixed corrupt relative paths.

## Release 1.0.8 (2024-02-13)

The Argh! Update.

* Activated test 2
* Transformer-API missed some Classes - sorry for that. They are noy published to outside World:
  * MD_Frontmatter_Template
  * MD_Frontmatter_Mapper
  * type MD_Frontmatter_Type
  * type FileContent_Interface

## Release 1.0.7 (2024-02-13)

For a working example take a look in the folder `test`

* fixed doku (still not quite correct)
* fixed api (various classes are falsly not exported)
* copy job only writes if the content of the source has been changed compared to the target.
* Simulation-Mode.
* Commands from Transformers to MD_Exporter.

- Use the file system properly:
  * Missing Paths are created on the fly.
  * It is only written if modified-date is different.
  * Check whether source file does not exist.

I am working on this topic:

* Frontmatter in the source file (or not)
  * Add frontmatter to copied files
  * Remove the best frontmatter
  * Include frontmatter in the source file
  * do mappings

## Release 1.0.6 (2024-02-12)

* comes with a copy-job to transport all the ressoures, images, and attachments
* The copy-job has a simulate property, so you can check if everything will land in the right places.

## Release 1.0.5 (2024-02-09)

* Complete redesigned for a more general approach.
* Runs now from json config file.
* The markdown file splitter is no longer a core feature, but also a Transformer.
* A directory of documents can now also be processed, including subdirectories.

## Release 1.0.4 (2024-02-07)

* First release.
* Supports one single file, splitting in separate files, and do some transformations.
