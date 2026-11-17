# `@mdx-js/content-mapper`

A TypeScript content mapper for MDX content.

The goal is to eventually merge this into [mdx-analyzer](https://github.com/mdx-js/mdx-analyzer) to
replace `@mdx-js/typescript-plugin`.

## Installation

```sh
npm install @mdx-js/content-mapper
```

## Usage

After [Configuring](#configuration) the content mapper, you can type check your project, including
MDX files, using the following command:

```sh
tsc --runExternalCode
```

## Configuration

In your [`tsconfig.json`](https://www.typescriptlang.org/tsconfig/) file, add this package to your
`contentMappers` array. Create the `contentMappers` array if you don’t have it yet.

```jsonc
{
  "compilerOptions": {
    "checkJs": true,
    "jsx": "react-jsx",
    "module": "preserve",
    "noEmit": true,
    "target": "esnext"
    // etc…
  },
  "contentMappers": [
    {
      "package": "@mdx-js/content-mapper",
      "extensions": [".mdx"],
      "options": {
        // Content mapper options go here.
      }
    }
  ]
}
```

### Extensions

The `extensions` field tells TypeScript which file extensions to let the content mapper handle.
Typically you want to add `.mdx`, but you should also add `.md` for example if you use the MDX
compiler to compile regular Markdown files.

### Options

#### `checkCodeBlocks`

If enabled, code blocks with the following languages are type checked:

- `cjs`
- `cts`
- `javascript`
- `javascriptreact`
- `js`
- `json`
- `jsonc`
- `jsx`
- `mjs`
- `mts`
- `ts`
- `tsx`
- `typescript`
- `typescriptreact`

Note that you must enable `allowJs` or `checkJs` to allow type checking of JavaScript code blocks.

#### `checkMdx`

If you didn’t specify `checkJs` in your compiler options, you can use this option to enable type
checking for MDX content. Note that you need to specify `allowJs` in the compiler options for this
to work.

#### `mdExtensions`

The MDX compiler compiles `.mdx` files to components, but it can also compile regular markdown
files. By default it uses the
[`markdown-extensions`](https://github.com/sindresorhus/markdown-extensions) to determine which file
to treat as markdown. You can use the `mdExtensions` field to override this.

Don’t forget to add any additional extensions you want to check to the [`extensions`](#extensions)
field as well.

#### `preset`

A preset helps infer MDX props for some popular frameworks. The following presets re supported:

- `next`: Infer the props for the [Next.js](https://nextjs.org)
  [App Router](https://nextjs.org/docs/app). This depends on the
  [route props helpers](https://nextjs.org/docs/app/getting-started/layouts-and-pages#route-props-helpers).
- `@react-router/fs-routes`: Infer the props for [React Router](https://reactrouter.com)’s
  [file route conventions](https://reactrouter.com/how-to/file-route-conventions). This depends on
  the [route module type safety](https://reactrouter.com/how-to/route-module-type-safety).

#### `providerImportSource`

This option allows you to define an MDX provider import source from which `useMDXComponents` is
imported. This is then used to type check the components you provide to your MDX files. This is
resolved relative to your `tsconfig.json` file.

Next.js supports the
[`mdx-components`](https://nextjs.org/docs/app/api-reference/file-conventions/mdx-components) file.
If you have this file, set this option to `./mdx-components` or `./src/mdx-components` respectively.

If you are using [`@mdx-js/react`](https://mdxjs.com/packages/react/),
[`@mdx-js/preact`](https://mdxjs.com/packages/preact/), or
[`@mdx-js/vue`](https://mdxjs.com/packages/vue/), you should ask yourself if you even need this
package. If you only use the provider in one place, you don’t. Instead, you can create a file named
`mdx-components.tsx` that exports a function named `useMDXComponents`:

```tsx
import { Banner } from './components/banner'
import { Button } from './components/button'
import { Chart } from './components/chart'

const components = {
  Banner,
  Button,
  Chart
} as const

export function useMDXComponents(): typeof components {
  return components
}
```

Now configure a [subpath import](https://nodejs.org/api/packages.html#subpath-imports) in your
`package.json` that points `#mdx-components` to this file. This will make your bundler and
TypeScript understand `#mdx-components` imports.

```jsonc
{
  "name": "your-app",
  "version": "1.0.0",
  "type": "module",
  "imports": {
    "#mdx-components": "./mdx-components.tsx"
    // Optional additional subpath umports…
  }
  // Rest of package.json…
}
```

Now set the MDX option `providerImportSource` to `#mdx-components` in your bundler configuration,
such as [`vite.config.js`](https://vite.dev/config/) or
[`webpack.config.js`](https://webpack.js.org/configuration/). Also set this option in the content
mapper.

If you **must** use multiple providers or provide components dynamically in some other way, you can
have a look at TypeScript
[project references](https://www.typescriptlang.org/docs/handbook/project-references.html).

#### `recmaPlugins`

An array of recma plugin names or plugin tuples to use. Currently the only supported plugin is
[`recma-export-filepath`](https://github.com/remcohaszing/recma-export-filepath)

#### `rehypePlugins`

An array of rehype plugin names or plugin tuples to use. Currently the only supported plugin is
[`rehype-mdx-title`](https://github.com/remcohaszing/rehype-mdx-title)

#### `remarkPlugins`

An array of remark plugin names or plugin tuples to use. Currently the only supported transformer
plugin is [`remark-mdx-frontmatter`](https://github.com/remcohaszing/remark-mdx-frontmatter).

Additionally, remark plugins are supported that extend MDX at the parser level. If you use such
plugins, you must make sure they are installed in your `node_modules`. Some popular plugins are:

- [`remark-directives`](https://github.com/remarkjs/remark-directives)
- [`remark-frontmatter`](https://github.com/remarkjs/remark-frontmatter)
- [`remark-gfm`](https://github.com/remarkjs/remark-gfm)
- [`remark-math`](https://github.com/remarkjs/remark-math)

## Compatibility

This project is compatible with TypeScript 7.1 or greater and Node.js 22 or greater.

## License

[MIT](LICENSE.md) © [Remco Haszing](https://github.com/remcohaszing)
