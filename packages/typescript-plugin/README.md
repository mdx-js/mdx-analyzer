# `@mdx-js/typescript-plugin`

[![Build][build-badge]][build]
[![Coverage][coverage-badge]][coverage]
[![Downloads][downloads-badge]][downloads]
[![Size][size-badge]][size]
[![Sponsors][sponsors-badge]][collective]
[![Backers][backers-badge]][collective]
[![Chat][chat-badge]][chat]

A [TypeScript plugin][] to support language features in [MDX][] files.

## Contents

* [What is this?](#what-is-this)
* [When should I use this?](#when-should-i-use-this)
* [Install](#install)
* [Use](#use)
  * [TypeScript](#typescript)
  * [Plugins](#plugins)
* [API](#api)
* [Compatibility](#compatibility)
* [Security](#security)
* [Contribute](#contribute)
* [Sponsor](#sponsor)
* [Changelog](#changelog)
* [License](#license)

## What is this?

This package provides a [TypeScript plugin][] for [MDX][].
This [TypeScript][] plugin provides editor features such as completion and
diagnostics in TypeScript based editors.

## When should I use this?

The [MDX extension for Visual Studio Code][vscode-mdx] registers this plugin
by default.
Other editors may install this in their own integration.
You can also choose to install the plugin in your project locally in order to
pin a version.

## Install

In Node.js (version 16+), install with [npm][]:

```sh
npm install @mdx-js/language-service
```

## Use

The [MDX extension for Visual Studio Code][vscode-mdx] registers this plugin
by default.
Other editors may install this in their own integration.

If you wish to add this plugin manually, add the following to your
`tsconfig.json` file:

```jsonc
{
  "compilerOptions": {
    "plugins": [
      {
        "name": "@mdx-js/typescript-plugin"
      }
    ]
  }
}
```

### TypeScript

For further instruction, see the
[TypeScript section](https://github.com/mdx-js/mdx-analyzer#typescript) of the
repository readme.

### Plugins

For information on plugin support, see the
[Plugins section](https://github.com/mdx-js/mdx-analyzer#plugins) of the
repository readme.

## API

This package exports a [TypeScript plugin][].
This is not intended for programmatic use.

## Compatibility

Projects maintained by the unified collective are compatible with all maintained
versions of Node.js.
As of now, that is Node.js and 16.0+.
Our projects sometimes work with older versions, but this is not guaranteed.

## Security

This package provides editor support for [MDX][] files.
Some editor features modify your source code, for example suggestions and
automatic refactors.
It is recommended to keep your source code under version control.

## Contribute

See [§ Contribute][contribute] on our website for ways to get started.
See [§ Support][support] for ways to get help.

This project has a [code of conduct][].
By interacting with this repository, organization, or community you agree to
abide by its terms.

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

[MIT][] © [Remco Haszing][author]

[author]: https://github.com/remcohaszing

[backers-badge]: https://opencollective.com/unified/backers/badge.svg

[build-badge]: https://github.com/mdx-js/mdx-analyzer/workflows/main/badge.svg

[build]: https://github.com/mdx-js/mdx-analyzer/actions

[chat-badge]: https://img.shields.io/badge/chat-discussions-success.svg

[chat]: https://github.com/mdx-js/mdx/discussions

[code of conduct]: https://github.com/mdx-js/.github/blob/main/code-of-conduct.md

[collective]: https://opencollective.com/unified

[contribute]: https://mdxjs.com/community/contribute/

[coverage-badge]: https://img.shields.io/codecov/c/github/mdx-js/mdx-analyzer/main.svg

[coverage]: https://codecov.io/github/mdx-js/mdx-analyzer

[downloads-badge]: https://img.shields.io/npm/dm/@mdx-js/language-service.svg

[downloads]: https://www.npmjs.com/package/@mdx-js/language-service

[mdx]: https://mdxjs.com

[mit]: LICENSE

[npm]: https://docs.npmjs.com/cli/install

[size-badge]: https://img.shields.io/bundlejs/size/@mdx-js/language-service

[size]: https://bundlejs.com/?q=@mdx-js/language-service

[sponsor]: https://mdxjs.com/community/sponsor/

[sponsors-badge]: https://opencollective.com/unified/sponsors/badge.svg

[support]: https://mdxjs.com/community/support/

[typescript]: https://typescriptlang.org

[typescript plugin]: https://www.typescriptlang.org/tsconfig#plugins

[vscode-mdx]: https://marketplace.visualstudio.com/items?itemName=unifiedjs.vscode-mdx
