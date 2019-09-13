# [Visual Studio Code](https://code.visualstudio.com) extension for [MDX]

Adds language support for [MDX].

## Installation

You can install this extension from the [Marketplace](https://marketplace.visualstudio.com/items?itemName=JounQin.vscode-mdx).

## Integration With [VS Code ESLint](https://github.com/microsoft/vscode-eslint)

1. First of all, you need to enable [eslint-plugin-mdx][] which makes it possible to lint `.mdx` or `.md` files with `ESLint`.

2. And then you will need to enable ESLint validation for `.mdx` and `.md` files like following:

```jsonc
// .vscode/settings.json
{
  "eslint.autoFixOnSave": true,
  "eslint.options": {
    "extensions": [".js", ".jsx", ".md", ".mdx", ".ts", ".tsx"]
  },
  "eslint.validate": [
    {
      "language": "javascript",
      "autoFix": true
    },
    {
      "language": "javascriptreact",
      "autoFix": true
    },
    {
      "language": "markdown",
      "autoFix": true
    },
    {
      "language": "mdx",
      "autoFix": true
    },
    {
      "language": "typescript",
      "autoFix": true
    },
    {
      "language": "typescriptreact",
      "autoFix": true
    }
  ]
}
```

### Markdown Syntax

Markdown Syntax could also be linted via [eslint-plugin-mdx][] and [remark-lint][] plugins.

> it will read [remark][]'s [configuration](https://github.com/remarkjs/remark/tree/master/packages/remark-cli#remark-cli) automatically via [cosmiconfig](https://github.com/davidtheclark/cosmiconfig). But `.remarkignore` will not be respected, you should use `.eslintignore` instead.

More usage detail please refer to [eslint-plugin-mdx][]'s [documentation](https://github.com/rx-ts/eslint-mdx#toc-).

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
[eslint-plugin-mdx]: https://github.com/rx-ts/eslint-mdx
[remark]: https://github.com/remarkjs/remark
[remark-lint]: https://github.com/remarkjs/remark-lint
