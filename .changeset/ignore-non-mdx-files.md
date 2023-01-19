---
vscode-mdx: patch
---

Previously the MDX language server handled TypeScript IntelliSense for
JavaScript and TypeScript files as well.
This led to duplicate IntelliSense results in the editor if people have also
enabled TypeScript IntelliSense.

These files are still synchronized with the MDX language server, because they
are needed for context, but they no longer yield results when interacted with.
