# Unresolved issues & planned features

* A regex-filter for the filereader to exclude some files.
* preserve folder structure.
* Transformations on the target filename.
* Run a joblist in batch.
* Implement job-propertys functions: doSubfolders, limit, useCounter.
* More Transformers
    * Cross-references
    * ...
* A Obsidian-Plugin or standalone App with a nice Graphical-User-Interface. 
* Add a frontmatter to a single file (or a batch of single files). At the moment, only the splitter does this.

* Load custom Transformers from the config file.
    * Mixup execution from config-file and adding a Transformer class like so:

```ts
const my_exporter: MD_Exporter = new MD_Exporter();

exporter.addTransformer(new MyTransformer(params));

my_exporter.perform_job_from("./transport-config.json", "Example-Job No.1");
```

What has been implemented so far:

# Release 1.0.17 (2024-03-06) 

* Adding and removing Items to the Markdown-Content Array is now better considered.
* `MD_Math_Transformer` Task to transform Transform Latex Formulas from Obsidian-Style to Hugo-Style...

 from this

```latex
$$
W_{kin} = \frac { m \cdot v^2}{2} = \frac {p^2}{ 2 \cdot m}
$$
```

to this

````latex
```math {.text-center}
$$
W_{kin} = \frac { m \cdot v^2}{2} = \frac {p^2}{ 2 \cdot m}
$$
```
````

# Release 1.0.16 (2024-03-04) 

* Wrong export fixed

# Release 1.0.15 (2024-02-16) 

Splitting a single large file already works fine, but I'm still working on case three: copying various individual files and mapping from the frontmatter of the source file to the target file. It's not working properly yet, but it's slowly getting better. 

# Release 1.0.14 (2024-02-14) 

* `copy_task` sadly didnt copy anything for some reasons. I fixed that.

# Release 1.0.13 (2024-02-14) 

* There was an Exception when no `copy_task` was defined. This no longer happens.

# Release 1.0.12 (2024-02-13) 
# Release 1.0.11 (2024-02-13) 

* updated READ_ME.md

# Release 1.0.10 (2024-02-13)
# Release 1.0.9 (2024-02-13)
 
* Another Argh! Update.
* Types (d.ts) missing
* fixed corrupt relative paths

# Release 1.0.8 (2024-02-13)

The Argh! Update.

* Activated test 2
* Transformer-API missed some Classes - sorry for thet. They are noy published to outside World:
    * MD_Frontmatter_Template
    * MD_Frontmatter_Mapper
    * type MD_Frontmatter_Type
    * type FileContent_Interface 

# Release 1.0.7 (2024-02-13)

For a working example take a look in the folder `test`

* fixed doku (still not quite correct)
* fixed api (various classes are falsly not exported)
* copy job only writes if the content of the source has been changed compared to the target.
* Simulation-Mode.
* Commands from Transformers to MD_Exporter. 
- Use the file system properly:
    - Missing Paths are created on the fly.
    - It is only written if modified-date is different.
    - Check whether source file does not exist.

I am working on this topic:

* Frontmatter in the source file (or not)
    * Add frontmatter to copied files
    * Remove the best frontmatter
    * Include frontmatter in the source file
    * do mappings

# Release 1.0.6 (2024-02-12)

* comes with a copy-job to transport all the ressoures, images, and attachments
* The copy-job has a simulate property, so you can check if everything will land in the right places.

# Release 1.0.5 (2024-02-09)

 * Complete redesigned for a more general approach.
 * Runs now from json config file.
 * The markdown file splitter is no longer a core feature, but also a Transformer.
 * A directory of documents can now also be processed, including subdirectories.

# Release 1.0.4 (2024-02-07)

* First release.
* Supports one single file, splitting in separate files, and do some transformations.