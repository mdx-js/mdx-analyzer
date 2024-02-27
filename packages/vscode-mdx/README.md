# MDX for Visual Studio Code

[![Build][build-badge]][build]
[![Coverage][coverage-badge]][coverage]
[![Visual Studio Marketplace Downloads][marketplace-badge]][marketplace]
[![Open VSX Downloads][openvsx-badge]][openvsx]
[![Sponsors][sponsors-badge]][collective]
[![Backers][backers-badge]][collective]
[![Chat][chat-badge]][chat]

[Visual Studio Code][vscode] extension to add language support for [MDX][].

## Contents

*   [Installation](#installation)
*   [Settings](#settings)
*   [TypeScript](#typescript)
*   [Plugins](#plugins)
*   [Syntax highlighting](#syntax-highlighting)
*   [ESLint](#eslint)
*   [Auto-close tags](#auto-close-tags)
*   [Sponsor](#sponsor)
*   [Changelog](#changelog)
*   [License](#license)

## Installation

[Get it on the VS Code Marketplace][marketplace] or install it by using Quick
Open (<kbd>Ctrl</kbd> + <kbd>P</kbd>) and running the following:

```txt
ext install unifiedjs.vscode-mdx
```

## Settings

All MDX language server configurations can be configured via
[Visual Studio Code][vscode] settings.
MDX for VSCode supports the following additional setting:

*   `mdx.server.enable` (`boolean`, default: `true`) —
    Enable the MDX language server.

## TypeScript

This extension offers type safety for MDX files based on TypeScript’s
[types in JSDoc][jsdoc].
For MDX specific details, see the
[TypeScript section](../language-server/README.md#typescript) of the MDX
language server documentation.

## Plugins

For information on plugin support, see the
[Plugins section](../language-server/README.md#plugins) of the MDX language
server documentation.

## Syntax highlighting

Syntax highlighting for MDX is based on the
[MDX TextMate grammar](https://github.com/wooorm/markdown-tm-language).

## ESLint

You can lint MDX with [ESLint][] using [`eslint-plugin-mdx`][eslint-plugin-mdx].
To integrate ESLint in Visual Studio Code, install the
[VS Code ESLint extension][vscode-eslint].

## Auto-close tags

If you want VS Code to automatically close tags while you type, install
[Auto Close Tag][] and configure it to also include the `mdx` language:

```jsonc
{
  "auto-close-tag.activationOnLanguage": [
    // …
    "mdx"
  ]
}
```

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
  <a href="https://markdown.space">Markdown Space</a><br><br>
  <a href="https://markdown.space"><img src="https://images.opencollective.com/markdown-space/e1038ed/logo/128.png" width="64"></a>
</td>
<td width="10%" align="center">
  <a href="https://www.holloway.com">Holloway</a><br><br>
  <a href="https://www.holloway.com"><img src="https://avatars1.githubusercontent.com/u/35904294?s=128&v=4" width="64"></a>
</td>
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

[auto close tag]: https://marketplace.visualstudio.com/items?itemName=formulahendry.auto-close-tag

[backers-badge]: https://opencollective.com/unified/backers/badge.svg

[build-badge]: https://github.com/mdx-js/mdx-analyzer/workflows/main/badge.svg

[build]: https://github.com/mdx-js/mdx-analyzer/actions

[chat-badge]: https://img.shields.io/badge/chat-discussions-success.svg

[chat]: https://github.com/mdx-js/mdx/discussions

[collective]: https://opencollective.com/unified

[coverage-badge]: https://img.shields.io/codecov/c/github/mdx-js/mdx-analyzer/main.svg

[coverage]: https://codecov.io/github/mdx-js/mdx-analyzer

[eslint-plugin-mdx]: https://github.com/mdx-js/eslint-mdx

[eslint]: https://eslint.org

[jounqin]: https://GitHub.com/JounQin

[jsdoc]: https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html

[marketplace-badge]: https://img.shields.io/visual-studio-marketplace/d/unifiedjs.vscode-mdx

[marketplace]: https://marketplace.visualstudio.com/items?itemName=unifiedjs.vscode-mdx

[mdx]: https://mdxjs.com

[mit]: http://opensource.org/licenses/MIT

[openvsx-badge]: https://img.shields.io/open-vsx/dt/unifiedjs/vscode-mdx

[openvsx]: https://open-vsx.org/extension/unifiedjs/vscode-mdx

[sponsor]: https://mdxjs.com/community/sponsor/

[sponsors-badge]: https://opencollective.com/unified/sponsors/badge.svg

[vscode-eslint]: https://github.com/microsoft/vscode-eslint

[vscode]: https://code.visualstudio.com
