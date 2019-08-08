# [Visual Studio Code](https://code.visualstudio.com) extension for [MDX]

Adds language support for [MDX].

## Installation

You can install this extension from the [Marketplace](https://marketplace.visualstudio.com/items?itemName=JounQin.vscode-mdx).

## What about `.md` files?

By default the MDX language is applied only to `.mdx` files. If MDX files in your project end with `.md`, you can tell VS Code that by adding the following to your workspace settings:

```json
"files.associations": {
  "*.md": "mdx"
},
```

## Auto-close tags

If you want VS Code to automatically close tags while you type, you can install [Auto Close Tag](https://marketplace.visualstudio.com/items?itemName=formulahendry.auto-close-tag) and configure it to also include the language `mdx`:

```json
"auto-close-tag.activationOnLanguage": [
  "xml",
  "php",
  "...",
  "mdx"
]
```

[mdx]: https://github.com/mdx-js/mdx
