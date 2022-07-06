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
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "eslint.options": {
    "extensions": [".js", ".jsx", ".md", ".mdx", ".ts", ".tsx"]
  },
  "eslint.validate": [
    "markdown",
    "mdx",
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ]
}
```

### Markdown Syntax

Markdown Syntax could also be linted via [eslint-plugin-mdx][] and [remark-lint][] plugins.

> it will read [remark][]'s [configuration](https://github.com/remarkjs/remark/tree/master/packages/remark-cli#remark-cli) automatically via [cosmiconfig](https://github.com/davidtheclark/cosmiconfig). But `.remarkignore` will not be respected, you should use `.eslintignore` instead.

More usage detail please refer to [eslint-plugin-mdx][]'s [documentation](https://github.com/mdx-js/eslint-mdx#toc-).

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

## Known `vscode-eslint` issues

1. `Fatal javascript OOM in GC during deserialization`

ESlint is using VS Code's old, built-in version of NodeJS (v12) as provided by Electron.
Please add the following setting to use system default Node runtime instead:

```json
{
  "eslint.runtime": "node"
}
```

Please visit https://github.com/microsoft/vscode-eslint/issues/1498#issuecomment-1175813839 as reference for details.

2. `JavaScript heap out of memory`

The default memory limit of Node.js is `1G`, please add the following setting to increase the limit:

```json
{
  "eslint.execArgv": ["--max_old_space_size=8192"]
}
```

Please visit https://github.com/microsoft/vscode-eslint/issues/733 as reference for details.

[mdx]: https://github.com/mdx-js/mdx
[eslint-plugin-mdx]: https://github.com/mdx-js/eslint-mdx
[remark]: https://github.com/remarkjs/remark
[remark-lint]: https://github.com/remarkjs/remark-lint
