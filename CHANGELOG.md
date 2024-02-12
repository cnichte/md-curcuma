# Unresolved issues & planned features

* A regex-filter for the filereader to exclude some files.
* Transformations on the target filename.
* Run a joblist in batch.
* Load custom Transformers from the config file.
* Implement job-propertys functions: doSubfolders, limit, useCounter.
* More Transformers
    * Cross-references
    * ...
* A Obsidian-Plugin or standalone App with a nice Graphical-User-Interface. 
* Add a frontmatter to a single file (or a batch of single files). At the moment, only the splitter does this.

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