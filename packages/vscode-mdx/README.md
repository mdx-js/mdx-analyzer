# [Visual Studio Code](https://code.visualstudio.com) extension for [MDX][]

[![GitHub Actions](https://github.com/mdx-js/vscode-mdx/workflows/main/badge.svg)](https://github.com/mdx-js/vscode-mdx/actions/workflows/main.yml)
[![Visual Studio Marketplace Version](https://img.shields.io/visual-studio-marketplace/v/unifiedjs.vscode-mdx)](https://marketplace.visualstudio.com/items?itemName=unifiedjs.vscode-mdx)
[![Visual Studio Marketplace Downloads](https://img.shields.io/visual-studio-marketplace/d/unifiedjs.vscode-mdx)](https://marketplace.visualstudio.com/items?itemName=unifiedjs.vscode-mdx)
[![Open VSX Version](https://img.shields.io/open-vsx/v/unifiedjs/vscode-mdx)](https://open-vsx.org/extension/unifiedjs/vscode-mdx)
[![Open VSX Downloads](https://img.shields.io/open-vsx/dt/unifiedjs/vscode-mdx)](https://open-vsx.org/extension/unifiedjs/vscode-mdx)

Adds language support for [MDX][].

## Installation

You can install this extension from the [Marketplace](https://marketplace.visualstudio.com/items?itemName=unifiedjs.vscode-mdx).

## Settings

This extension provides the following settings:

*   `mdx.experimentalLanguageServer`: Enable experimental IntelliSense support
    for MDX files.  (`boolean`, default: false)

## Plugins

This extension supports remark syntax plugins.
Plugins can be defined in an array of strings or string / options tuples.
These plugins can be defined in `tsconfig.json` and will be resolve relative to
that file.

For example, to support [frontmatter][] with YAML and TOML and [GFM][]:

```jsonc
{
  "compilerOptions": {
    // …
  },
  "mdx": {
    "plugins": [
      [
        "remark-frontmatter",
        ["toml", "yaml"]
      ],
      "remark-gfm"
    ]
  }
}
```

For a more complete list, see [remark plugins][].

## Integration With [VS Code ESLint](https://github.com/microsoft/vscode-eslint)

1.  First of all, you need to enable [eslint-plugin-mdx][] which makes it
    possible to lint `.mdx` or `.md` files with `ESLint`.

2.  And then you will need to enable ESLint validation for `.mdx` and `.md`
    files like following:

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

Markdown Syntax could also be linted via [eslint-plugin-mdx][] and
[remark-lint][] plugins.

> it will read [remark][]’s
> [configuration](https://github.com/remarkjs/remark/tree/main/packages/remark-cli#remark-cli)
> automatically via [cosmiconfig](https://github.com/davidtheclark/cosmiconfig).
> But `.remarkignore` will not be respected, you should use `.eslintignore`
> instead.

More usage detail please refer to [eslint-plugin-mdx][]’s [documentation](https://github.com/mdx-js/eslint-mdx#toc-).

## Auto-close tags

If you want VS Code to automatically close tags while you type, you can install
[Auto Close Tag](https://marketplace.visualstudio.com/items?itemName=formulahendry.auto-close-tag)
and configure it to also include the language `mdx`:

```json
"auto-close-tag.activationOnLanguage": [
  "xml",
  "php",
  "...",
  "mdx"
]
```

## Known `vscode-eslint` issues

1.  `Fatal javascript OOM in GC during deserialization`

    ESlint is using VS Code’s old, built-in version of NodeJS (v12) as provided
    by Electron.
    Please add the following setting to use system default Node runtime instead:

    ```json
    {
      "eslint.runtime": "node"
    }
    ```

    Please visit
    [microsoft/vscode-eslint#1498 (comment)](https://github.com/microsoft/vscode-eslint/issues/1498#issuecomment-1175813839)
    as reference for details.

2.  `JavaScript heap out of memory`

    The default memory limit of Node.js is `1G`, please add the following
    setting to increase the limit:

    ```json
    {
      "eslint.execArgv": ["--max_old_space_size=8192"]
    }
    ```

    Please visit
    [microsoft/vscode-eslint#733](https://github.com/microsoft/vscode-eslint/issues/733)
    as reference for details.

## Sponsor

See [§ Sponsor][sponsor] on our site for how to help financially.

<table>
<tr valign="middle">
<td width="20%" align="center" rowspan="2" colspan="2">
  <a href="https://vercel.com">Vercel</a><br><br>
  <a href="https://vercel.com"><img src="https://avatars1.githubusercontent.com/u/14985020?s=256&v=4" width="128"></a>
</td>
<td width="20%" align="center" rowspan="2" colspan="2">
  <a href="https://motif.land">Motif</a><br><br>
  <a href="https://motif.land"><img src="https://avatars1.githubusercontent.com/u/74457950?s=256&v=4" width="128"></a>
</td>
<td width="20%" align="center" rowspan="2" colspan="2">
  <a href="https://www.hashicorp.com">HashiCorp</a><br><br>
  <a href="https://www.hashicorp.com"><img src="https://avatars1.githubusercontent.com/u/761456?s=256&v=4" width="128"></a>
</td>
<td width="20%" align="center" rowspan="2" colspan="2">
  <a href="https://www.gitbook.com">GitBook</a><br><br>
  <a href="https://www.gitbook.com"><img src="https://avatars1.githubusercontent.com/u/7111340?s=256&v=4" width="128"></a>
</td>
<td width="20%" align="center" rowspan="2" colspan="2">
  <a href="https://www.gatsbyjs.org">Gatsby</a><br><br>
  <a href="https://www.gatsbyjs.org"><img src="https://avatars1.githubusercontent.com/u/12551863?s=256&v=4" width="128"></a>
</td>
</tr>
<tr valign="middle"></tr>
<tr valign="middle">
<td width="20%" align="center" rowspan="2" colspan="2">
  <a href="https://www.netlify.com">Netlify</a><br><br>
  <!--OC has a sharper image-->
  <a href="https://www.netlify.com"><img src="https://images.opencollective.com/netlify/4087de2/logo/256.png" width="128"></a>
</td>
<td width="10%" align="center">
  <a href="https://www.coinbase.com">Coinbase</a><br><br>
  <a href="https://www.coinbase.com"><img src="https://avatars1.githubusercontent.com/u/1885080?s=256&v=4" width="64"></a>
</td>
<td width="10%" align="center">
  <a href="https://themeisle.com">ThemeIsle</a><br><br>
  <a href="https://themeisle.com"><img src="https://avatars1.githubusercontent.com/u/58979018?s=128&v=4" width="64"></a>
</td>
<td width="10%" align="center">
  <a href="https://expo.io">Expo</a><br><br>
  <a href="https://expo.io"><img src="https://avatars1.githubusercontent.com/u/12504344?s=128&v=4" width="64"></a>
</td>
<td width="10%" align="center">
  <a href="https://boostnote.io">Boost Note</a><br><br>
  <a href="https://boostnote.io"><img src="https://images.opencollective.com/boosthub/6318083/logo/128.png" width="64"></a>
</td>
<td width="10%" align="center">
  <a href="https://www.holloway.com">Holloway</a><br><br>
  <a href="https://www.holloway.com"><img src="https://avatars1.githubusercontent.com/u/35904294?s=128&v=4" width="64"></a>
</td>
<td width="10%"></td>
<td width="10%"></td>
<td width="10%"></td>
</tr>
<tr valign="middle">
<td width="100%" align="center" colspan="8">
  <br>
  <a href="https://opencollective.com/unified"><strong>You?</strong></a>
  <br><br>
</td>
</tr>
</table>

## Changelog

Detailed changes for each release are documented in [CHANGELOG.md](./CHANGELOG.md).

## License

[MIT][] © [JounQin][]@[1stG.me][]

[1stg.me]: https://www.1stg.me

[eslint-plugin-mdx]: https://github.com/mdx-js/eslint-mdx

[frontmatter]: https://github.com/remarkjs/remark-frontmatter

[gfm]: https://github.com/remarkjs/remark-gfm

[jounqin]: https://GitHub.com/JounQin

[mdx]: https://github.com/mdx-js/mdx

[mit]: http://opensource.org/licenses/MIT

[remark]: https://github.com/remarkjs/remark

[remark-lint]: https://github.com/remarkjs/remark-lint

[remark plugins]: https://github.com/remarkjs/remark/blob/main/doc/plugins.md

[sponsor]: https://mdxjs.com/community/sponsor/
