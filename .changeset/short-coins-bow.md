---
'vscode-mdx': minor
---

Support for highlighting JSX evaluated expressions

In JSX, you can include JS expressions within tags, like:

```mdx
<Component>
  {doSomething('a', 7)}
</Component>
```

This PR adds syntax highlighting for those expressions by adding a new pattern
in the `tmLanguage.json`.
