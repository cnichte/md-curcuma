# Curcuma UI

Embedded React 19/Mantine 8 components in the same repository as Curcuma Core.
`SourceTargetTable` accepts host-rendered source, target and rule cells. It does
not invent a shared website-slot/CSV-column schema. `RuleEditor` edits the validated
Core contract; invalid intermediate edits remain local, are displayed explicitly
and are not passed to persistence. The host can disable preview/closing through
`onValidityChange`. `TransformationPreview` displays the exact Core result.

Hosts supply labels, semantic theme colors, persistence and execution callbacks.
The package has no Electron, IPC, filesystem, credentials or network imports.
Window chrome is owned by the host (e.g. Studio's GenericWindow). Configuration
autosave is not publication approval.

For a standalone website host, run `npx vite examples --host 127.0.0.1` after
building. The example uses host-owned Modal chrome, no Studio services and
the same transformation result contract. Hosts using symlinked development
packages must deduplicate React and Mantine in their bundler.

Build Core first, then `npm install` and `npm test` in this package. Published
artifacts contain compiled JS and declarations, not paths into Studio.
