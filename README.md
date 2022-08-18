# [Visual Studio Code](https://code.visualstudio.com) extension for [MDX][]

[![GitHub Actions](https://github.com/mdx-js/vscode-mdx/workflows/CI/badge.svg)](https://github.com/mdx-js/vscode-mdx/actions/workflows/ci.yml)
[![GitHub release](https://img.shields.io/github/release/mdx-js/vscode-mdx)](https://github.com/mdx-js/vscode-mdx/releases)
[![Visual Studio Marketplace Version](https://img.shields.io/visual-studio-marketplace/v/unifiedjs.vscode-mdx)](https://marketplace.visualstudio.com/items?itemName=unifiedjs.vscode-mdx)
[![Visual Studio Marketplace Downloads](https://img.shields.io/visual-studio-marketplace/d/unifiedjs.vscode-mdx)](https://marketplace.visualstudio.com/items?itemName=unifiedjs.vscode-mdx)
![Open VSX Version](https://img.shields.io/open-vsx/v/unifiedjs/vscode-mdx)
![Open VSX Downloads](https://img.shields.io/open-vsx/dt/unifiedjs/vscode-mdx)
[![Language grade: JavaScript](https://img.shields.io/lgtm/grade/javascript/g/mdx-js/vscode-mdx.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/mdx-js/vscode-mdx/context:javascript)

[![Conventional Commits](https://img.shields.io/badge/conventional%20commits-1.0.0-yellow.svg)](https://conventionalcommits.org)
[![Renovate enabled](https://img.shields.io/badge/renovate-enabled-brightgreen.svg)](https://renovatebot.com)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com)
[![Code Style: Prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![changesets](https://img.shields.io/badge/maintained%20with-changesets-176de3.svg)](https://github.com/changesets/changesets)

Adds language support for [MDX][].

## Installation

You can install this extension from the [Marketplace](https://marketplace.visualstudio.com/items?itemName=unifiedjs.vscode-mdx).

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

Please visit <https://github.com/microsoft/vscode-eslint/issues/1498#issuecomment-1175813839> as reference for details.

2. `JavaScript heap out of memory`

The default memory limit of Node.js is `1G`, please add the following setting to increase the limit:

```json
{
  "eslint.execArgv": ["--max_old_space_size=8192"]
}
```

Please visit <https://github.com/microsoft/vscode-eslint/issues/733> as reference for details.

## Sponsors

| 1stG                                                                                                                               | RxTS                                                                                                                               | UnTS                                                                                                                               |
| ---------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| [![1stG Open Collective backers and sponsors](https://opencollective.com/1stG/organizations.svg)](https://opencollective.com/1stG) | [![RxTS Open Collective backers and sponsors](https://opencollective.com/rxts/organizations.svg)](https://opencollective.com/rxts) | [![UnTS Open Collective backers and sponsors](https://opencollective.com/unts/organizations.svg)](https://opencollective.com/unts) |

[![unified Open Collective backers and sponsors](https://opencollective.com/unified/organizations.svg)](https://opencollective.com/unified)

## Backers

| 1stG                                                                                                                             | RxTS                                                                                                                             | UnTS                                                                                                                             |
| -------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| [![1stG Open Collective backers and sponsors](https://opencollective.com/1stG/individuals.svg)](https://opencollective.com/1stG) | [![RxTS Open Collective backers and sponsors](https://opencollective.com/rxts/individuals.svg)](https://opencollective.com/rxts) | [![UnTS Open Collective backers and sponsors](https://opencollective.com/unts/individuals.svg)](https://opencollective.com/unts) |

[![unified Open Collective backers and sponsors](https://opencollective.com/unified/individuals.svg)](https://opencollective.com/unified)

## Changelog

Detailed changes for each release are documented in [CHANGELOG.md](./CHANGELOG.md).

## License

[MIT][] © [JounQin][]@[1stG.me][]

[1stg.me]: https://www.1stg.me
[eslint-plugin-mdx]: https://github.com/mdx-js/eslint-mdx
[jounqin]: https://GitHub.com/JounQin
[mdx]: https://github.com/mdx-js/mdx
[mit]: http://opensource.org/licenses/MIT
[remark]: https://github.com/remarkjs/remark
[remark-lint]: https://github.com/remarkjs/remark-lint
