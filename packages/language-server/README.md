# `@mdx-js/language-service`

## What is this?

This package provides a [language server][lsp] for [MDX][].
The language server provides intellisense based on [TypeScript][], as well as
some markdown specific features.

## When should I use this?

You can use this package if you want to enhance your editor with intellisense
for [MDX][] files.
Some editors can consume this package directly, others need a plugin in order to
consume this package.

## Install

This package is not published yet.

## Use

Usage of this package depends on your editor integration.

This package provides the CLI `mdx-language-server`.
Because this is based on [`vscode-languageserver`][vscode-languageserver], the
same transports are supported.

## Language server features

This language server supports the following features:

*   Markdown definitions
*   Markdown hover hints
*   TypeScript completions
*   TypeScript definitions
*   TypeScript diagnostics
*   TypeScript hover hints
*   TypeScript references

[MDX][] doesn’t support TypeScript syntax, but it does support
[types in JSDoc][jsdoc].
The special type `Props` is used to determine the type used for `props`.
For example:

<!-- prettier-ignore -->

```mdx
{/**
  * @type {object} Props
  * @property {string} name
  * Who to greet.
  */}

# Hello {props.name}
```

## Compatibility

Projects maintained by the unified collective are compatible with all maintained
versions of Node.js.
As of now, that is Node.js 14.14+ and 16.0+.
Our projects sometimes work with older versions, but this is not guaranteed.

This project uses [`vscode-languageserver`][vscode-languageserver] 7, which
implements language server protocol 3.17.0.
It should work anywhere where LSP 3.6.0 or later is implemented.

## Security

This package provides intellisense for [MDX][] files.
Some intellisense features modify your source code, for example suggestions and
automatic refactors.
It is recommended to keep your source code under version control.

## Contribute

See [§ Contribute][contribute] on our website for ways to get started.
See [§ Support][support] for ways to get help.

This project has a [code of conduct][].
By interacting with this repository, organization, or community you agree to
abide by its terms.

## License

[MIT][] © [Remco Haszing][author]

[author]: https://github.com/remcohaszing

[code of conduct]: https://github.com/mdx-js/.github/blob/main/code-of-conduct.md

[contribute]: https://mdxjs.com/community/contribute/

[jsdoc]: https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html

[lsp]: https://microsoft.github.io/language-server-protocol

[mdx]: https://mdxjs.com

[mit]: LICENSE

[support]: https://mdxjs.com/community/support/

[typescript]: https://typescriptlang.org

[vscode-languageserver]: https://github.com/microsoft/vscode-languageserver-node/tree/main/server
