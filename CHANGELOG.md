# Unresolved issues & planned features

* A regex-filter for the filereader to exclude some files.
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