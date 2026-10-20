# Curcuma Core

Headless, validated text/Markdown content transformations. This package lives
beside the embedded UI in the Curcuma repository. It has no React, Electron,
filesystem or network runtime dependency. It does not replace the existing
format readers or render Markdown to HTML.

`TextRuleContract.parse` validates serializable rules; `TextTransformer.transform`
is shared by preview, execution and the JSON CLI. Conditions inspect the original
input, actions run in order. Matching is case-sensitive; replace is literal and
replaces every occurrence. No conditions means unconditional. A failed condition
returns `blocked` without an output, never an implicit exclusion.

Build/test: `npm run build`, `npm test` in this package.
CLI: `curcuma-transform` reads `{ "input": "...", "rules": ... }` from stdin.
Exit 0 = ready, 2 = blocked, 1 = invalid input/execution error. The CLI never writes
content files. Hosts own persistence, source selection, release and transfer.
