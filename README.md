# MDX Analyzer

[![Build][build-badge]][build]
[![Coverage][coverage-badge]][coverage]
[![Sponsors][sponsors-badge]][collective]
[![Backers][backers-badge]][collective]
[![Chat][chat-badge]][chat]

This repository contains the code to provide editor tooling support for [MDX][].

## Contents

* [Workspaces](#workspaces)
* [Use](#use)
  * [TypeScript](#typescript)
  * [Plugins](#plugins)
* [Contribute](#contribute)
* [Sponsor](#sponsor)
* [License](#license)

## Workspaces

This repository contains the following workspaces:

* [`@mdx-js/language-service`][] provides utilities to integrate MDX into
  [Volar][].
* [`@mdx-js/language-server`][] provides an MDX language server using the
  [Language Server Protocol][].
* [`@mdx-js/typescript-plugin`][] provides a [TypeScript plugin][] to integrate
  MDX in TypeScript editors.
* [`vscode-mdx`][] integrates the MDX language server into
  [Visual Studio Code][], but also provides some Visual Studio Code specific
  features such as syntax highlighting.

## Use

### TypeScript

[MDX][] doesn’t support TypeScript syntax, but it does support
[types in JSDoc][jsdoc].

MDX type checking support is similar to JavaScript support.
By default, type hints are subtle.
To enable strict type checking, you need to specify `mdx.checkMdx` in
`tsconfig.json`:

```jsonc
{
  "compilerOptions": {
    // …
  },
  "mdx": {
    // Enable strict type checking in MDX files.
    "checkMdx": true
  }
}
```

#### `Props`

The `Props` type is a special type which is used to determine the type used for
[`props`][props].
For example:

```mdx
{/**
  * @typedef Props
  * @property {string} name
  *   Who to greet.
  */}

# Hello {props.name}
```

#### `MDXProvidedComponents`

The special type `MDXProvidedComponents` is used to determine which components
are [provided][provider].
For example:

```mdx
{/**
  * @typedef MDXProvidedComponents
  * @property {typeof import('../components/Planet.js').Planet} Planet
  */}

<Planet name="Earth" />
```

You can also define this type externally, and import it into your MDX file.
Based on a [Next.js][next mdx] example:

```typescript
// mdx-components.ts
import { Planet } from './components/Planet.js'

const components = {
  Planet
}

export type MDXProvidedComponents = typeof components

export function useMDXComponents(): MDXProvidedComponents {
  return components
}
```

Then in your MDX file:

```mdx
{/**
  * @import {MDXProvidedComponents} from '../mdx-components.js'
  */}

<Planet name="Earth" />
```

Another alternative is to define the `MDXProvidedComponents` type globally.
This way you don’t have to define `MDXProvidedComponents` in each MDX file.
Based on a [Next.js][next mdx] example:

```typescript
// mdx-components.ts
import { Planet } from './components/Planet.js'

const components = {
  Planet
}

declare global {
  type MDXProvidedComponents = typeof components
}

export function useMDXComponents(): MDXProvidedComponents {
  return components
}
```

Now you can write the following MDX with full type safety anywhere:

```mdx
<Planet name="Earth" />
```

### Plugins

This extension supports remark parser plugins.
Plugins can be defined in an array of strings or string / options tuples.
These plugins can be defined in `tsconfig.json` and will be resolved relative to
that file.
Transformers such as [`remark-mdx-frontmatter`][remark-mdx-frontmatter] are not
supported yet.
Support is tracked in
[#297](https://github.com/mdx-js/mdx-analyzer/issues/297).

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

## Contribute

See [§ Contribute][contribute] on our site for ways to get started.
See [§ Support][support] for ways to get help.

This project has a [code of conduct][coc].
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

## License

[MIT][] © [JounQin][]@[1stG.me][]

[`@mdx-js/language-server`]: https://github.com/mdx-js/mdx-analyzer/tree/main/packages/language-server

[`@mdx-js/language-service`]: https://github.com/mdx-js/mdx-analyzer/tree/main/packages/language-service

[`@mdx-js/typescript-plugin`]: https://github.com/mdx-js/mdx-analyzer/tree/main/packages/typescript-plugin

[`vscode-mdx`]: https://github.com/mdx-js/mdx-analyzer/tree/main/packages/vscode-mdx

[1stg.me]: https://www.1stg.me

[backers-badge]: https://opencollective.com/unified/backers/badge.svg

[build-badge]: https://github.com/mdx-js/mdx-analyzer/workflows/main/badge.svg

[build]: https://github.com/mdx-js/mdx-analyzer/actions

[chat-badge]: https://img.shields.io/badge/chat-discussions-success.svg

[chat]: https://github.com/mdx-js/mdx/discussions

[coc]: https://github.com/mdx-js/.github/blob/main/code-of-conduct.md

[collective]: https://opencollective.com/unified

[contribute]: CONTRIBUTING.md

[coverage-badge]: https://img.shields.io/codecov/c/github/mdx-js/mdx-analyzer/main.svg

[coverage]: https://codecov.io/github/mdx-js/mdx-analyzer

[frontmatter]: https://github.com/remarkjs/remark-frontmatter

[gfm]: https://github.com/remarkjs/remark-gfm

[jounqin]: https://GitHub.com/JounQin

[jsdoc]: https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html

[language server protocol]: https://microsoft.github.io/language-server-protocol/

[mdx]: https://github.com/mdx-js/mdx

[mit]: http://opensource.org/licenses/MIT

[next mdx]: https://nextjs.org/docs/pages/building-your-application/configuring/mdx

[props]: https://mdxjs.com/docs/using-mdx/#props

[provider]: https://mdxjs.com/docs/using-mdx/#mdx-provider

[remark plugins]: https://github.com/remarkjs/remark/blob/main/doc/plugins.md

[remark-mdx-frontmatter]: https://github.com/remcohaszing/remark-mdx-frontmatter

[sponsor]: https://mdxjs.com/community/sponsor/

[sponsors-badge]: https://opencollective.com/unified/sponsors/badge.svg

[support]: https://mdxjs.com/community/support/

[typescript plugin]: https://www.typescriptlang.org/tsconfig#plugins

[visual studio code]: https://code.visualstudio.com/

[volar]: https://volarjs.dev
