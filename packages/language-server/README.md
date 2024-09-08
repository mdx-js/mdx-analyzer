# `@mdx-js/language-server`

[![Build][build-badge]][build]
[![Coverage][coverage-badge]][coverage]
[![Downloads][downloads-badge]][downloads]
[![Sponsors][sponsors-badge]][collective]
[![Backers][backers-badge]][collective]
[![Chat][chat-badge]][chat]

A [language server][lsp] for [MDX][].

## Contents

* [What is this?](#what-is-this)
* [When should I use this?](#when-should-i-use-this)
* [Install](#install)
* [Use](#use)
  * [Language server features](#language-server-features)
  * [Initialize Options](#initialize-options)
  * [Configuration](#configuration)
  * [TypeScript](#typescript)
  * [Plugins](#plugins)
* [Examples](#examples)
  * [Visual Studio Code](#visual-studio-code)
* [Compatibility](#compatibility)
* [Security](#security)
* [Contribute](#contribute)
* [Sponsor](#sponsor)
* [Changelog](#changelog)
* [License](#license)

## What is this?

This package provides a [language server][lsp] for [MDX][].
The language server provides editor support based on [Volar][].
This includes support for [TypeScript][] as well as some MDX specific features.

## When should I use this?

You can use this package if you want to enhance your editor for [MDX][] files
with features such as autocomplete and error diagnostics.
Some editors can consume this package directly, others need a plugin in order to
consume this package.

## Install

In Node.js (version 16+), install with [npm][]:

```sh
npm install @mdx-js/language-server
```

## Use

How to use this package depends on your editor integration.

This package provides the `mdx-language-server` CLI.
Because this is based on [`vscode-languageserver`][vscode-languageserver], the
same transports are supported.

### Language server features

This language server supports all features supported by
[`volar-service-markdown`][volar-service-markdown] and
[`volar-service-typescript`][volar-service-typescript], plus some additional
features specific to MDX.

#### Commands

The language server supports the following [LSP commands][]:

##### `mdx.toggleDelete`

Toggle delete syntax at the cursor position.
It uses the `workspace/applyEdit` command to apply edits.

###### Arguments

* `uri` — The URI of the document to apply changes to.
* `range` — The current selection range of the user.

###### Returns

`null`

##### `mdx.toggleEmphasis`

Toggle emphasis syntax at the cursor position.
It uses the `workspace/applyEdit` command to apply edits.

###### Arguments

* `uri` — The URI of the document to apply changes to.
* `range` — The current selection range of the user.

###### Returns

`null`

##### `mdx.toggleInlineCode`

Toggle inline code syntax at the cursor position.
It uses the `workspace/applyEdit` command to apply edits.

###### Arguments

* `uri` — The URI of the document to apply changes to.
* `range` — The current selection range of the user.

###### Returns

`null`

##### `mdx.toggleStrong`

Toggle strong syntax at the cursor position.
It uses the `workspace/applyEdit` command to apply edits.

###### Arguments

* `uri` — The URI of the document to apply changes to.
* `range` — The current selection range of the user.

###### Returns

`null`

### Initialize Options

MDX language server supports the following LSP initialization options:

* `typescript.enabled` (`boolean`, default: `false`) —
  If true, enable TypeScript.
* `typescript.tsdk` (`string`, required) —
  The path from which to load TypeScript.
* `locale` (`string`, optional) —
  The locale to use for TypeScript error messages.

### Configuration

MDX language server supports the following LSP configuration options:

* `mdx.trace.server.verbosity` (`"off"` | `"messages"` | `"compact"` |
  `"verbose"`, default: `"off"`) —
  Trace MDX language server requests in the output console.
* `mdx.trace.server.format` (`"text"` | `"json"`, default: `"text"`) —
  How to format traced MDX language server requests.
* `mdx.validate.validateReferences` (`"ignore"` | `"hint"` | `"warning"` |
  `"error"`, default: `"warning"`) —
  Diagnostic level for invalid reference links, e.g. `[text][no-such-ref]`.
* `mdx.validate.validateFragmentLinks` (`"ignore"` | `"hint"` | `"warning"` |
  `"error"`, default: `"warning"`) —
  Diagnostic level for fragments links to headers in the current file that don’t
  exist, e.g. `[text](#no-such-header)`
* `mdx.validate.validateFileLinks` (`"ignore"` | `"hint"` | `"warning"` |
  `"error"`, default: `"warning"`) —
  Diagnostic level for links to local files that don’t exist, e.g.
  `[text](./no-such-file.png)`.
* `mdx.validate.validateMarkdownFileLinkFragments` (`"ignore"` | `"hint"` |
  `"warning"` | `"error"`, default: `"warning"`) —
  Diagnostic level for the fragment part of links to other local markdown files,
  e.g. `[text](./no-such-file.png)`.
* `mdx.validate.validateUnusedLinkDefinitions` (`"ignore"` | `"hint"` |
  `"warning"` | `"error"`, default: `"warning"`) —
  Diagnostic level for link definitions that aren’t used anywhere.
  `[never-used]: http://example.com`.
* `mdx.validate.validateDuplicateLinkDefinitions` (`"ignore"` | `"hint"` |
  `"warning"` | `"error"`, default: `"warning"`) —
  Diagnostic level for duplicate link definitions.
* `mdx.validate.ignoreLinks` (`Array<string>`, optional) —
  Glob of links that should not be validated.

### TypeScript

This extension offers type safety for MDX files based on TypeScript’s
[types in JSDoc][jsdoc].
For MDX specific details, see the
[TypeScript section](https://github.com/mdx-js/mdx-analyzer#typescript) of the
repository readme.

### Plugins

For information on plugin support, see the
[Plugins section](https://github.com/mdx-js/mdx-analyzer#plugins) of the
repository readme.

## Examples

MDX language server can be integrated with any server that supports
[language servers][lsp].
Does your editor support MDX language server, but is it not in this list?
Feel free to add it.

### Visual Studio Code

Use `unifiedjs.vscode-mdx` to use the MDX language server with
[Visual Studio Code][vscode].

## Compatibility

Projects maintained by the unified collective are compatible with all maintained
versions of Node.js.
As of now, that is Node.js and 16.0+.
Our projects sometimes work with older versions, but this is not guaranteed.

This project uses [`vscode-languageserver`][vscode-languageserver] 9, which
implements language server protocol 3.17.4.
It should work anywhere where LSP 3.6.0 or later is implemented.

## Security

This package provides IntelliSense for [MDX][] files.
Some IntelliSense features modify your source code, for example suggestions and
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

[downloads-badge]: https://img.shields.io/npm/dm/@mdx-js/language-server.svg

[downloads]: https://www.npmjs.com/package/@mdx-js/language-server

[jsdoc]: https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html

[lsp]: https://microsoft.github.io/language-server-protocol

[lsp commands]: https://microsoft.github.io/language-server-protocol/specifications/lsp/3.17/specification/#command

[mdx]: https://mdxjs.com

[mit]: LICENSE

[npm]: https://docs.npmjs.com/cli/install

[sponsor]: https://mdxjs.com/community/sponsor/

[sponsors-badge]: https://opencollective.com/unified/sponsors/badge.svg

[support]: https://mdxjs.com/community/support/

[typescript]: https://typescriptlang.org

[volar-service-markdown]: https://github.com/volarjs/services/tree/master/packages/markdown

[volar-service-typescript]: https://github.com/volarjs/services/tree/master/packages/typescript

[volar]: https://volarjs.dev

[vscode-languageserver]: https://github.com/microsoft/vscode-languageserver-node/tree/main/server

[vscode]: https://code.visualstudio.com
