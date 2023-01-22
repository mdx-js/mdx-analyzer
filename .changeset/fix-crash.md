---
vscode-mdx: patch
---

Fix a crash that occurs if:

*   no `tsconfig.json` exists.
*   `tsconfig.json` specifies `includes`, but doesn’t include the MDX file.
*   `tsconfig.json` specifies `excludes` and excludes the MDX file.
*   a new file is created.
*   a file is renamed.
