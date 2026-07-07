---
'@mdx-js/language-service': minor
'vscode-mdx': minor
---

Add a `type` option to the `remark-mdx-frontmatter` plugin.
When set, the `frontmatter` export is typed with the given type instead of
`any`.
Its YAML values are also checked against the type when `checkMdx` is enabled:
missing properties, wrong value types, and unknown keys are reported on the
frontmatter block.
Each frontmatter key gets hover, go to definition, and completion from the
schema too, including completion on blank lines.
Virtual code plugins may now return source mappings from `finalize` to support
this.
