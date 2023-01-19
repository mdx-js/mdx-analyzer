---
vscode-mdx: minor
---

Support remark syntax plugins.

Syntax plugins can be added by adding an `mdx` section in your `tsconfig.json`
file.
This is then parsed following the same format as `unified-engine`
[configuration][].

For example, to support [frontmatter][] and [GFM][], add the following section
to `tsconfig.json`:

```jsonc
{
  "compilerOptions": {
    // …
  },
  "mdx": {
    "plugins": [
      "remark-frontmatter",
      "remark-gfm"
    ]
  }
}
```

[configuration]: https://github.com/unifiedjs/unified-engine/blob/main/doc/configure.md

[frontmatter]: https://github.com/remarkjs/remark-frontmatter

[gfm]: https://github.com/remarkjs/remark-gfm
