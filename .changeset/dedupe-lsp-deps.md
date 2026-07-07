---
'@mdx-js/language-server': patch
---

Pin `vscode-languageserver-protocol` and `vscode-markdown-languageservice` so a
lockfile-free install resolves a single, working dependency tree.
Without these, floating ranges now resolve two copies of the
`vscode-languageserver` protocol types, and a `vscode-markdown-languageservice`
release whose ESM `import uri from 'vscode-uri'` has no default export, which
crashes the server on start under the `require(esm)` support in modern Node.
