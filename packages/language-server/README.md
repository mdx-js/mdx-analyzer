# `@mdx-js/language-service`

## What is this?

This package provides a [language server][lsp] for [MDX][].
The language server provides IntelliSense based on [TypeScript][], as well as
some markdown specific features.

## When should I use this?

You can use this package if you want to enhance your editor with IntelliSense
for [MDX][] files.
Some editors can consume this package directly, others need a plugin in order to
consume this package.

## Install

This package is [ESM only][esm].
In Node.js (version 16+), install with [npm][]:

```sh
npm install remark-rehype
```

In Deno with [`esm.sh`][esmsh]:

```js
import remarkRehype from 'https://esm.sh/remark-rehype@11'
```

## Use

How to use this package depends on your editor integration.

This package provides the CLI `mdx-language-server`.
Because this is based on [`vscode-languageserver`][vscode-languageserver], the
same transports are supported.

## Language server features

This language server supports all features supported by
[`volar-service-markdown`][volar-service-markdown] and
[`volar-service-typescript`][volar-service-typescript]

[MDX][] doesn’t support TypeScript syntax, but it does support
[types in JSDoc][jsdoc].
The special type `Props` is used to determine the type used for `props`.
For example:

<!-- prettier-ignore -->

```mdx
{/**
  * @typedef Props
  * @property {string} name
  *   Who to greet.
  */}

# Hello {props.name}
```

## Plugins

This extension supports remark syntax plugins.
Plugins can be defined in an array of strings or string / options tuples.
These plugins can be defined in `tsconfig.json` and will be resolved relative to
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

## License

[MIT][] © [Remco Haszing][author]

[author]: https://github.com/remcohaszing

[code of conduct]: https://github.com/mdx-js/.github/blob/main/code-of-conduct.md

[contribute]: https://mdxjs.com/community/contribute/

[esm]: https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c

[esmsh]: https://esm.sh

[frontmatter]: https://github.com/remarkjs/remark-frontmatter

[gfm]: https://github.com/remarkjs/remark-gfm

[jsdoc]: https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html

[lsp]: https://microsoft.github.io/language-server-protocol

[mdx]: https://mdxjs.com

[mit]: LICENSE

[npm]: https://docs.npmjs.com/cli/install

[remark plugins]: https://github.com/remarkjs/remark/blob/main/doc/plugins.md

[support]: https://mdxjs.com/community/support/

[typescript]: https://typescriptlang.org

[volar-service-markdown]: https://github.com/volarjs/services/tree/master/packages/markdown

[volar-service-typescript]: https://github.com/volarjs/services/tree/master/packages/typescript

[vscode-languageserver]: https://github.com/microsoft/vscode-languageserver-node/tree/main/server
