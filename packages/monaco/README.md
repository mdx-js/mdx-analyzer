# `@mdx-js/monaco`

## What is this?

This package intellisense for [MDX][] in [Monaco editor][].
This package provides intellisense based on [TypeScript][], as well as some
markdown specific features.

## When should I use this?

You can use this package if you want to integrate intellisense for [MDX][] files
in a browser.

## Install

This package is not published yet.

## Use

```js
import { initializeMonacoMdx } from '@mdx-js/monaco'
import * as monaco from 'monaco-editor'

// Register the worker
window.MonacoEnvironment = {
  getWorker(_workerId, label) {
    switch (label) {
      case 'editorWorkerService':
        return new Worker(
          new URL(
            'monaco-editor/esm/vs/editor/editor.worker.js',
            import.meta.url,
          ),
        )
      case 'json':
        return new Worker(
          new URL(
            'monaco-editor/esm/vs/language/json/json.worker.js',
            import.meta.url,
          ),
        )
      case 'javascript':
      case 'typescript':
        return new Worker(
          new URL(
            'monaco-editor/esm/vs/language/typescript/ts.worker.js',
            import.meta.url,
          ),
        )
      case 'mdx':
        return new Worker(
          new URL('@mdx-js/monaco/mdx.worker.js', import.meta.url),
        )
      default:
        throw new Error(`Unsupported worker label: ${label}`)
    }
  },
}

// Initialize the MDX intellisense
initializeMonacoMdx(monaco)

// Create a model
const content = `
{/**
  * @type {object} Props
  * @property {string} name
  * Who to greet.
  */}

# Hello {props.name}
`

const model = monaco.editor.createModel(
  content,
  undefined,
  monaco.Uri.parse('file:///hello.mdx'),
)

// Create the editor
const element = document.getElementById('editor')
const editor = monaco.editor.create(element, { model })
```

## Examples

A [demo][] is available.

## Language features

The language integration supports the following features:

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

## Compatibility

This project is compatible with evergreen browsers.
It requires at least `monaco-editor` version `0.34`.
This project is likely to work with later versions of Monaco editor as well, but
this is not guaranteed.

## Types

This package is fully typed with [TypeScript][]

## Security

This package provides intellisense for [MDX][] models.
Some intellisense features modify your model content, for example suggestions
and automatic refactors.

## Contribute

See [§ Contribute][contribute] on our website for ways to get started.
See [§ Support][support] for ways to get help.

This project has a [code of conduct][].
By interacting with this repository, organization, or community you agree to
abide by its terms.

## See also

*   [monaco-tailwindcss](https://monaco-tailwindcss.js.org)
*   [monaco-unified](https://monaco-unified.js.org)
*   [monaco-yaml](https://monaco-yaml.js.org)

## License

[MIT][] © [Remco Haszing][author]

[author]: https://github.com/remcohaszing

[code of conduct]: https://github.com/mdx-js/.github/blob/main/code-of-conduct.md

[contribute]: https://mdxjs.com/community/contribute

[demo]: https://github.com/mdx-js/vscode-mdx/tree/HEAD/demo

[jsdoc]: https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html

[mdx]: https://mdxjs.com

[mit]: LICENSE

[monaco editor]: https://github.com/microsoft/monaco-editor

[support]: https://mdxjs.com/community/support

[typescript]: https://typescriptlang.org
