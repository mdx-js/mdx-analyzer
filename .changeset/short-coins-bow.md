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

### Limitations
It will still highlight JS that isn’t valid to include in a JSX evaluated expression (eg. a class definition), which as far as I can tell is a limitation of how embedded languages work in TextMate syntax highlighting definitions.