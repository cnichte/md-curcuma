# MD-Curcuma - The Longform Markdown Splitter

Copys and transforms Markdown files from [Obsidian](https://obsidian.md/) for usage in [Hugo](https://gohugo.io).

* This thing ist done with [Typescript](https://www.typescriptlang.org/).
* Inspired by: https://github.com/accraze/split-md
* Why not [golang](https://golang.org/)? So you can use it easier outside the golang unsiverse.

## The Problem

* I have a long Markdown document that was compiled with the [Obsidian Longform plugin](https://github.com/kevboh/longform).
* I would like to make this available on my website.
* The website is built with [Hugo](https://gohugo.io).
* For this purpose, the longform document is to be split into several individual documents.
* Be Hugo compatible.
  * The individual documents should be equipped with frontmatter.
  * autogenerate uuids
* Certain content may need to be transformed:
  * Hugo shortcodes.
  * Remove TODOs.
  * Insert download buttons.
  * ...

It would be nice to be able to build customized transformers for different solutions.

## Further Requirements

* The splitting should be done on headings: e.g.: `# `
* The text of the heading is used as the filename
  * If necessary, with a number in front, if necessary replace special characters url conform
* Insert frontmatter and initialize correctly.
* Remove heading (preferably as an option)
* Replace images with shortcode, e.g:
  * Obsidian: `![[ein-bild.jpg]]`
  * Hugo replacement: `{{<image folder="images/ein-bild.jpg" >}}`.
* Copy images and documents on the fly. 
  * A simulation mode provides information about which images and attachments it expects and where. 

## Restrictions

* It only runs in Backend, not in Browsers.

## Usage

Write some Typescript like that:

```ts
import { MD_Exporter } from "longform-markdown-splitter";

const my_exporter: MD_Exporter = new MD_Exporter();
my_exporter.perform_job_from("./transport-config.json", "Example-Job No.1");
```

and provide a `config-file`, and a `frontmatter-file` to get this...

1. transforms `![[image-1.jpg]]` in `{{< image src="assets/images/image-1.jpg" >}}`
2. transforms `![[docu-1.pdf]]` in `{{< button href="/getthis.php?id=docu-1" name="download docu-1 (pdf)" >}}`
3. removes paragraphes: `- [ ] #TODO Some serious stuff to do...`
4. Splits the file on Headlines `# ` in separate files and adds frontmatter

The file `transport-config.json`:

```json
{
  "job_list": [
    {
      "job_name": "Example-Job No.1",
      "job_description": "Example Job Description",
      "job_parameter": {
        "readPath": "./test/obsidian-vault/longform.md",
        "writePath": "./test/hugo-content-1/",
        "doSubfolders": false,
        "limit": 100,
        "useCounter": false
      },
      "job_tasks": [
        {
          "transformer_class_name": "MD_Frontmatter_Transformer",
          "transformer_parameter": {
            "frontmatter_filename": "./test/frontmatter-template.md",
            "frontmatter": {}
          }
        },
        {
          "transformer_class_name": "MD_ObsidianLink_Transformer",
          "transformer_parameter": {
            "tag_obsidian_prefix": "![[",
            "tag_obsidian_suffix": "]]",
            "find_rule": "jpg|png",
            "replace_template": "{{< lightbox-docs id=\"0\" folder=\"images/kursbuch-sv/{name}/*\" showImageNr=0 >}}",
            "copy_task":{
              "source":"test/obsidian-vault/images/",
              "target":"test/hugo-content-2/assets/images/{name}/",
              "simulate":false
            }

          }
        },
        {
          "transformer_class_name": "MD_ObsidianLink_Transformer",
          "transformer_parameter": {
            "tag_obsidian_prefix": "![[",
            "tag_obsidian_suffix": "]]",
            "find_rule": "pdf|ods|odp",
            "replace_template": "{{< button href=\"/getthis.php?id={name}\" name=\"download {name} ({name_suffix})\" >}}",
            "copy_task":{
              "source":"test/obsidian-vault/attachments/",
              "target":"test/hugo-content-2/static/downloads/",
              "simulate":false
            }
          }
        },
        {
          "transformer_class_name": "MD_RemoveTODOS_Transformer",
          "transformer_parameter": {
            "find_rule": "- [ ] #TODO ",
            "replace_template": ""
          }
        },
        {
          "transformer_class_name": "MD_Splitter_Transformer",
          "transformer_parameter": {
            "pattern": "# ",
            "cleanName": "# ",
            "limit": 100,
            "hasCounter": false,
            "weightBase": 8000,
            "url_prefix": "test-prefix",
            "doRemoveHeadline": true,
            "frontmatter_filename": "./test/frontmatter-template.md",
            "frontmatter": {}
          }
        }
      ]
    }
  ]
}
```

and the frontmatter-file `frontmatter-template.md`:

```yaml
---
title: "{title}"
description: ""
url: /docs/{url_prefix}-{url}/
date: {date}
draft: false
images: []
menu:
  docs:
    parent: "docs-9602b15bad02600f3883f55e2ade6b81"
    identifier: "{url_prefix}-{url}-{uuid}"
weight: {weight}
toc: true
---

```

run the script. Hopefully it has created something :-)

## Where to use?

The Transport-Scripts can be used...

1. in the Hugo-Project - and pull from Obsidian Vault.
2. in Obsidian - and push to your Hugo project. I will write an Obsidian-Plugin for that in near future.
3. as stand allone project between Obsidian and Hugo - so it does pulling and pushig.

I recommend Option `3` at the moment.

## Install it

* create a `project-folder`
* open that folder, an in it...

```bash
npm init
# follow the guide
npm install longform-markdown-splitter
# check typescript installation
tsc --version
```

create a `tsconfig.json`

If you use it inside your Hugo Project, some folders are excluded per default.

```json
{
  "compilerOptions": {
    "module": "commonjs",
    "target": "ES5",
    "noImplicitAny": true,
    "removeComments": true,
    "preserveConstEnums": true,
    "sourceMap": false,
    "baseUrl": "./",
    "rootDir":"transport-scripts",
    "outDir": "transport-scripts-compiled"
  },
  "include": ["transport-scripts/**/*"],
  "exclude": [
    "assets",
    "config",
    "content",
    "data",
    "layouts",
    "node_modules",
    "resources",
    "static",
    "transport-scripts-compiled"
  ]
}
```

Look in the `test` folder for running examples. 

Create two folders for your scripts:

* `transport-scripts` - holds the typescript source-code
* `transport-scripts-compiled`

The first is for the Typescript source-code, the second is for the Java script that will later be compiled from it.

## compile to javascript

To simplify handling, include the following build commands in the `package.json`: 

The ts suffix in `build:ts` separates it from the golag scripts which i name `build:go`, but of course you can call them whatever you like.

```json
    "build:ts": "rm -rf transport-scripts-compiled && tsc",
    "watch:ts": "tsc --watch",
```

## Create The Example Markdown-Files

* create folder `test`, and in folder test 
  * create folder `test/obsidian-fault/` - an put your longform.md in it.
  * create folder `test/hugo-content/` - this is the target directory

## Create a Transport-Script 


In folder `transport-scripts`create the file `split-my-longform.ts` and paste the code:

```ts
const my_exporter: MD_Exporter = new MD_Exporter();
my_exporter.perform_job_from("./transport-config.json", "Example-Job No.1");
```

That is all was needed when you provide a config file and a frontmatter file.

You can do it the other - the long - way:

```ts
import {
  MD_Frontmatter_Template,
  MD_ObsidianLink_Transformer,
  MD_RemoveTODOS_Transformer,
  MD_Splitter_Parameter_Type,
  MD_Transformer_Parameter_Type,
} from "longform-markdown-splitter";
import {
  MD_Exporter,
  MD_Exporter_Parameter_Type,
} from "longform-markdown-splitter";


const exporter: MD_Exporter = new MD_Exporter();

// Basic instructions for MD_Exporter

const exporter_parameter: MD_Exporter_Parameter_Type = {
  readPath: "test/obsidian-vault/longform.md",
  writePath: "test/hugo-content-2/",
  doSubfolders: false,
  limit: 1990,
  useCounter: false
};

const simulate_copy_job = true;

// The tasks to operate. If you add not tasks you have a simple copy job.

// Placeholders in the Transformer-Template
// as pre defined in MD_Transformer_TemplateValues_Type in the md-transformer module:
// {name_full} {name_suffix} {name}
const parameter_images: MD_Transformer_Parameter_Type = {
  tag_obsidian_prefix: "![[",
  tag_obsidian_suffix: "]]",
  find_rule: "jpg|png",
  replace_template: `{{< image src="assets/images/{name_full}" >}}`,
  copy_task: {
    source:"test/obsidian-vault/images/",
    target:"test/hugo-content-2/assets/images/{name}/",
    simulate:simulate_copy_job
  }
};

const parameter_docs: MD_Transformer_Parameter_Type = {
  tag_obsidian_prefix: "![[",
  tag_obsidian_suffix: "]]",
  find_rule: "pdf|ods|odp",
  replace_template: `{{< button href="/getthis.php?id={name}" name="download {name} ({name_suffix})" >}}`,
  copy_task: {
    source:"test/obsidian-vault/attachments/",
    target:"test/hugo-content-2/static/downloads/",
    simulate:simulate_copy_job
  }
};

const parameter_remove: MD_Transformer_Parameter_Type = {
  tag_obsidian_prefix: "", // TODO optional?
  tag_obsidian_suffix: "", // TODO optional?
  find_rule: "- [ ] #TODO ",
  replace_template: ``,
};

// The Markdown-Splitter Task needs a Frontmatter

// The placeholders result from the definition of MD_Frontmatter_Type in md-frontmatter
// A file definition in frontmatter_filename, overwrites frontmatter Property
var splitter_frontmatter: MD_Frontmatter = new MD_Frontmatter(`---
title: "{title}"
description: ""
url: /docs/{url_prefix}-{url}/
date: {date}
draft: false
images: []
menu:
  docs:
    parent: "docs-9602b15bad02600f3883f55e2ade6b81"
    identifier: "{url_prefix}-{url}-{uuid}"
weight: {weight}
toc: true
---\n\n`);

const parameter_splitter: MD_Splitter_Parameter_Type = {
  pattern: "# ",
  cleanName: "# ",
  limit: 100,
  hasCounter: false,
  weightBase: 8000,
  url_prefix: "test-prefix",
  doRemoveHeadline: true,
  frontmatter_filename: "", // ./test/frontmatter-template.md
  frontmatter: splitter_frontmatter
};

exporter.addTransformer(new MD_ObsidianLink_Transformer(parameter_images));
exporter.addTransformer(new MD_ObsidianLink_Transformer(parameter_docs));
exporter.addTransformer(new MD_RemoveTODOS_Transformer(parameter_remove));
exporter.addTransformer(new MD_Splitter_Transformer(parameter_splitter));

exporter.perform_job(exporter_parameter);

```

## Compile The Transport-Script

The scripts can then be used as follows. In the terminal:

* `npm run build:ts` - build the library.
* `npm run watch:ts` - watch and compile on change to javascript.

The compiled files end up in the `transport-scripts-compiled` directory.


## Run the Script in VSCode

* In Visual Studio Code
* Go to the directory `transport-scripts-compiled`
* On the compiled `.js` file
* Mouse right klick -> Menu-Entry `Run Code`

Look in the `test` folder to check the result.

![](readme-images/test-folder.png)

Observe the console output on the Output tab. The images and documents shown in the log have to be copied over manually at the moment. 

![](readme-images/test-console-output.png)

## Build A Custom Transformer 1

```ts
import { MD_Exporter_Parameter_Type } from "src/md-exporter";
import { MD_Transformer_AbstractBase } from "src/md-transformer";

interface MD_Custom_Parameter_Type {
  custom_property: string;
}

class MD_Custom_Transformer extends MD_Transformer_AbstractBase {

    parameter: MD_Custom_Parameter_Type;
  
    constructor(parameter: MD_Custom_Parameter_Type ){
      super();
      this.parameter = parameter;
    }
  
    public set_job_parameter(job_paramter: MD_Exporter_Parameter_Type): void {
      super.set_job_parameter(job_paramter); // this is a hack
    }

    transform(file_content: MD_FileContent_Interface, index: number): Array<string> {

      const source = file_content.body_array;
      // file_content.frontmatter;
      // file_content.frontmatter_attributes;

      if (source[index].indexOf(this.parameter.find_rule) >= 0) {
        console.log(`Transform before: ${source[index]}`);
        source.splice(index, 1);
        console.log(`Transform after: ${source[index]}`);
      }

      return source;
    }
  }
```

You cannot currently call this Transformer from a configuration file, but only if you instantiate it in your script. But I'm still going to build something for it :-)