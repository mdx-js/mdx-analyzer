---
'vscode-mdx': minor
---

Support for highlighting JSX evaluated expressions

In JSX, you can include JS expressions within tags, like:
```
<ATag>
{doSomething(‘a’, 7)}
</asdfadf
```

This PR adds syntax highlighting for those expressions by adding a new pattern in the `tmLanguage.json`.