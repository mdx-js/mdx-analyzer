# `@mdx-js/language-service`

## What is this?

This package implements the logic needed to provide [MDX][] IntelliSense.
This is done by wrapping the [TypeScript][] language service.

## When should I use this?

This package is intended for use by `@mdx-js/language-server`.
It’s not intended for external usage.

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

In browsers with [`esm.sh`][esmsh]:

```html
<script type="module">
  import remarkRehype from 'https://esm.sh/remark-rehype@11?bundle'
</script>
```

## Use

This package is intended for internal use only.
If you do want to use this package for something else, please to let us know
your use case in a [discussion][].

## API

This package exports the identifier `getLanguageModule`.
There is no default export.

### `getLanguageModule(ts[, plugins])`

Create a [Volar][] language module to support [MDX][].

#### Parameters

*   `ts`: The TypeScript module.
*   `plugins`: A list of remark syntax plugins.
    Only syntax plugins are supported.
    Transformers are unused.

#### Returns

A Volar language service that can handle MDX.

## Types

This package is fully typed with [TypeScript][].

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

[discussion]: https://github.com/orgs/mdx-js/discussions

[esm]: https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c

[esmsh]: https://esm.sh

[mdx]: https://mdxjs.com

[mit]: LICENSE

[npm]: https://docs.npmjs.com/cli/install

[support]: https://mdxjs.com/community/support/

[typescript]: https://typescriptlang.org

[volar]: https://volarjs.dev
