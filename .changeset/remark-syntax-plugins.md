---
vscode-mdx: minor
---

Support remark syntax plugins.

This extension supports remark syntax plugins.
Plugins can be defined in an array of strings or string / options tuples.
These plugins can be defined in `tsconfig.json` and will be resolved relative to
that file.

For example, to support
[frontmatter](https://github.com/remarkjs/remark-frontmatter) with YAML and TOML
and [GFM](https://github.com/remarkjs/remark-gfm):

```jsonc
{
  "compilerOptions": {
    // …
  },
  "mdx": {
    "plugins": [
      [
        "remark-frontmatter",
        ["toml", "yaml"]
      ],
      "remark-gfm"
    ]
  }
}
```
