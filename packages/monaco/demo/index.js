import { initializeMonacoMDX } from '@mdx-js/monaco'
// @ts-expect-error
import MDXWorker from '@mdx-js/monaco/mdx.worker.js?worker'
import * as monaco from 'monaco-editor'
// @ts-expect-error
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker.js?worker'

window.MonacoEnvironment = {
  getWorker(workerId, label) {
    switch (label) {
      case 'editorWorkerService':
        return new EditorWorker()
      case 'mdx':
        return new MDXWorker()
    }
  },
}

monaco.languages.register({
  id: 'mdx',
  extensions: ['.mdx'],
})

initializeMonacoMDX(monaco)

const element = /** @type {HTMLDivElement} */ (
  document.querySelector('#editor')
)

const model = monaco.editor.createModel(
  `// MDX combines markdown and JSX
import { MyComponent } from 'my-library'

# Hello

This is a [link][mdx]

// This is JSX
<MyComponent />

[mdx]: https://mdx-js.com
`,
  undefined,
  monaco.Uri.parse('file:///document.mdx'),
)

monaco.editor.create(element, {
  automaticLayout: true,
  model,
  theme: window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'vs-dark'
    : 'vs-light',
})
