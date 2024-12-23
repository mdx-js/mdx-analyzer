# `@mdx-js/language-service`

[![Build][build-badge]][build]
[![Coverage][coverage-badge]][coverage]
[![Downloads][downloads-badge]][downloads]
[![Size][size-badge]][size]
[![Sponsors][sponsors-badge]][collective]
[![Backers][backers-badge]][collective]
[![Chat][chat-badge]][chat]

[MDX][] support for [Volar][].

## Contents

* [What is this?](#what-is-this)
* [When should I use this?](#when-should-i-use-this)
* [Install](#install)
* [Use](#use)
* [API](#api)
  * [`createMdxLanguagePlugin([plugins][, checkMdx][, jsxImportSource])`](#createmdxlanguagepluginplugins-checkmdx-jsximportsource)
  * [`createMdxServicePlugin(options)`](#createmdxservicepluginoptions)
  * [`resolveRemarkPlugins(mdxConfig, resolvePlugin)`](#resolveremarkpluginsmdxconfig-resolveplugin)
* [Compatibility](#compatibility)
* [Types](#types)
* [Security](#security)
* [Contribute](#contribute)
* [Sponsor](#sponsor)
* [Changelog](#changelog)
* [License](#license)

## What is this?

This package implements the logic needed to integrate [MDX][] into [Volar][].
It implements a language plugin which makes Volar understand MDX files.
It also implements a service plugin, which provides some additional
functionality specific to MDX files.

## When should I use this?

This package is intended for use by
[`@mdx-js/language-server`][mdx-language-server].
It can also be used with other [Volar][] integrations, such as
[`@volar/monaco`][volar-monaco].

## Install

This package is [ESM only][esm].
In Node.js (version 16+), install with [npm][]:

```sh
npm install @mdx-js/language-service
```

In Deno with [`esm.sh`][esmsh]:

```js
import {
  createMdxLanguagePlugin,
  createMdxServicePlugin,
  resolveRemarkPlugins
} from 'https://esm.sh/@mdx-js/language-service'
```

In browsers with [`esm.sh`][esmsh]:

```html
<script type="module">
  import {
    createMdxLanguagePlugin,
    createMdxServicePlugin,
    resolveRemarkPlugins
  } from 'https://esm.sh/@mdx-js/language-service?bundle'
</script>
```

## Use

This package exports functions for use with [Volar][].
See the [API](#api) documentation for each function to see what it does.

## API

This package exports the identifiers `createMdxLanguagePlugin`,
`createMdxServicePlugin`, and `resolveRemarkPlugins`.
There is no default export.

### `createMdxLanguagePlugin([plugins][, checkMdx][, jsxImportSource])`

Create a [Volar][] language plugin to support [MDX][].

#### Parameters

* `plugins` ([`PluggableList`][pluggablelist], optional) —
  A list of remark syntax plugins.
  Only syntax plugins are supported.
  Transformers are unused.
* `checkMdx` (`boolean`, default: `false`) —
  If true, check MDX files strictly.
* `jsxImportSource` (`string`, default: `react`) —
  The JSX import source to use in the embedded JavaScript file.

#### Returns

A Volar language plugin to support MDX.

### `createMdxServicePlugin(options)`

Create a [Volar][] service module to support [MDX][].
The service supports:

* Reporting diagnostics for parsing errors.
* Document drop support for images.
* Custom commands.

The following commands are supported:

* `mdx.toggleDelete` — Toggle delete syntax at the cursor position.
  This takes the URI as its first argument, and the LSP selection range as its
  second argument.
* `mdx.toggleEmphasis` — Toggle emphasis syntax at the cursor position.
  This takes the URI as its first argument, and the LSP selection range as its
  second argument.
* `mdx.toggleInlineCode` — Toggle inline code syntax at the cursor position.
  This takes the URI as its first argument, and the LSP selection range as its
  second argument.
* `mdx.toggleStrong` — Toggle strong syntax at the cursor position.
  This takes the URI as its first argument, and the LSP selection range as its
  second argument.

#### Parameters

* `options` — An object with the following properties:
  * `applyEdit` — A function to apply an LSP workspace edit.

#### Returns

The Volar service plugin for MDX files.

### `resolveRemarkPlugins(mdxConfig, resolvePlugin)`

Resolve remark plugins from TypeScript’s parsed command line options.

#### Parameters

* `mdxConfig` (`unknown`) —
  The parsed command line options from which to resolve plugins.
* `resolvePlugin` (`Function`) —
  A function which takes a plugin name, and resolvs it to a remark plugin.

#### Returns

An array of resolved plugins, or `undefined` in case of an invalid
configuration.

## Compatibility

Projects maintained by the unified collective are compatible with all maintained
versions of Node.js.
As of now, that is Node.js and 16.0+.
Our projects sometimes work with older versions, but this is not guaranteed.

## Types

This package is fully typed with [TypeScript][].

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

[esm]: https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c

[esmsh]: https://esm.sh

[mdx-language-server]: https://github.com/mdx-js/mdx-analyzer/tree/main/packages/language-server

[mdx]: https://mdxjs.com

[mit]: LICENSE

[npm]: https://docs.npmjs.com/cli/install

[pluggablelist]: https://github.com/unifiedjs/unified?tab=readme-ov-file#pluggablelist

[size-badge]: https://img.shields.io/bundlejs/size/@mdx-js/language-service

[size]: https://bundlejs.com/?q=@mdx-js/language-service

[sponsor]: https://mdxjs.com/community/sponsor/

[sponsors-badge]: https://opencollective.com/unified/sponsors/badge.svg

[support]: https://mdxjs.com/community/support/

[typescript]: https://typescriptlang.org

[volar-monaco]: https://github.com/volarjs/volar.js/tree/master/packages/monaco

[volar]: https://volarjs.dev
