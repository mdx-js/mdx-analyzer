# `@mdx-js/language-service`

## What is this?

This package implements the logic needed to provide [MDX][] intellisense.
This is done by wrapping the [TypeScript][] language service.

## When should I use this?

This package is intended for use by `@mdx-js/monaco` and `@mdx-js/language-server`.
It’s not intended for external usage.

## Install

This package is not published yet.

## Use

This package is intended for internal use only.
If you do want to use this package for something else, please to let us know
your use case in a [discussion][].

## API

This package exports the identifier `createMDXLanguageService`.
There is no default export.

### `createMDXLanguageService(ts, host[, plugins])`

Create a [TypeScript][] language service that can handle [MDX][].

#### Options

*   `ts`: The TypeScript module.
*   `host`: The TypeScript language service host.
*   `plugins`: A list of remark syntax plugins.
    Only syntax plugins are supported.
    Transformers are unused.

#### Returns

A [TypeScript][] language service that can handle [MDX][].

## Types

This package does not expose [TypeScript][] types, because it’s not intended for
external use.

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

[discussion]: https://github.com/orgs/mdx-js/discussions

[mdx]: https://mdxjs.com

[mit]: LICENSE

[support]: https://mdxjs.com/community/support/

[typescript]: https://typescriptlang.org
