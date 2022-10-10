import './index.css'

import { initializeMonacoMDX } from '@mdx-js/monaco'
import * as monaco from 'monaco-editor'

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
      case 'javascript':
      case 'typescript':
        return new Worker(
          new URL(
            'monaco-editor/esm/vs/language/typescript/ts.worker.js',
            import.meta.url,
          ),
        )
      default:
        throw new Error(`Unsupported worker label: ${label}`)
    }
  },
}

monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
  checkJs: true,
  moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
})

monaco.languages.typescript.typescriptDefaults.setWorkerOptions({
  customWorkerPath: './custom.worker.js',
})

monaco.languages.register({
  id: 'mdx',
  extensions: ['.mdx'],
})

initializeMonacoMDX(monaco)

const element = /** @type {HTMLDivElement} */ (
  document.querySelector('#editor')
)

const model = monaco.editor.createModel(
  `import { Avatar } from './avatar.js'
import { sum } from './sum.js'

{/**
  * @typedef {object} Props
  * @property {number} age
  * The age of the user.
  * @property {string} name
  * The name to display.
  * @property {string} avatar
  * The avatar to display.
  */}

<Avatar src={props.age} />

# Hello

MDX combines markdown and JSX

{sum(['1', 2])}


This is a [link][mdx]

// This is JSX
<MyComponent />

{/**
  * This function renders a React element.
  */}
export function MyComponent() {
  return <div>Hello intellisense!</div>
}

{/**
  * @param {Props} props
  */}
export function WithLayout(props) {
  return <MDXContent {...props} />
}

<div>

  This is markdown content

  Hello {props.name}

</div>

Hello {props.name}

[mdx]: https://mdx-js.com

`,
  undefined,
  monaco.Uri.parse('file:///document.mdx'),
)

const models = [
  monaco.editor.createModel(
    `
/**
 * Add two numbers together.
 */
export function add(a: number, b: number): number {
  return a + b
}
`,
    undefined,
    monaco.Uri.parse('file:///add.ts'),
  ),
  model,
  monaco.editor.createModel(
    `
import { add } from './add'

/**
 * Create a sum of all numbers
 */
export function sum(numbers: number[]): number {
  let total = 0

  for(const number of numbers) {
    total = add(total, number)
  }

  return total
}
`,
    undefined,
    monaco.Uri.parse('file:///sum.ts'),
  ),
  monaco.editor.createModel(
    `interface AvatarProps {
  src: string;
}

export function Avatar({ src }: AvatarProps) {
  return <img src={src} />
}
`,
    undefined,
    monaco.Uri.parse('file:///avatar.tsx'),
  ),
]

function getModel() {
  return (
    models.find(
      model => model.uri.path.slice(1) === window.location.hash.slice(1),
    ) || model
  )
}

const editor = monaco.editor.create(element, {
  automaticLayout: true,
  model: getModel(),
  theme: window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'vs-dark'
    : 'vs-light',
})

/**
 * @param {monaco.Uri} resource
 */
function updateMarkers(resource) {
  const problems = document.querySelector('#problems')
  if (!problems) {
    return
  }
  const markers = monaco.editor.getModelMarkers({ resource })
  while (problems.lastChild) {
    problems.lastChild.remove()
  }
  for (const marker of markers) {
    if (marker.severity === monaco.MarkerSeverity.Hint) {
      continue
    }
    const wrapper = document.createElement('div')
    wrapper.setAttribute('role', 'button')
    const codicon = document.createElement('div')
    const text = document.createElement('div')
    wrapper.classList.add('problem')
    codicon.classList.add(
      'codicon',
      marker.severity === monaco.MarkerSeverity.Warning
        ? 'codicon-warning'
        : 'codicon-error',
    )
    text.classList.add('problem-text')
    text.textContent = marker.message
    wrapper.append(codicon, text)
    wrapper.addEventListener('click', () => {
      editor.setPosition({
        lineNumber: marker.startLineNumber,
        column: marker.startColumn,
      })
      editor.focus()
    })
    problems.append(wrapper)
  }
}

window.addEventListener('hashchange', () => {
  const model = getModel()
  editor.setModel(model)
  updateMarkers(model.uri)
})

monaco.editor.onDidChangeMarkers(([resource]) => {
  if (String(resource) === String(getModel().uri)) {
    updateMarkers(resource)
  }
})

/**
 * @typedef {object} EditorService
 * @property {(input: { resource: monaco.Uri }, source: monaco.editor.IStandaloneCodeEditor) => Promise<unknown>} openCodeEditor
 * Resolve a reference.
 */

// @ts-expect-error This API isn’t officially exposed.
// https://github.com/microsoft/monaco-editor/issues/2000
const editorService = /** @type {EditorService} */ (editor._codeEditorService)
const openEditorBase = editorService.openCodeEditor.bind(editorService)

editorService.openCodeEditor =
  /**
   * @param {{ resource: monaco.Uri }} input
   * @param {monaco.editor.IStandaloneCodeEditor} source
   */
  async (input, source) => {
    const result = await openEditorBase(input, source)

    if (!result) {
      location.hash = input.resource.path.slice(1)
    }

    return result
  }
