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

monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
  checkJs: true,
  moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
})

monaco.languages.typescript.typescriptDefaults.setWorkerOptions({
  customWorkerPath: './mdx.override.js',
})

monaco.languages.register({
  id: 'mdx',
  extensions: ['.mdx'],
})

initializeMonacoMDX(monaco)

const fileTree = /** @type {HTMLElement} */ (document.querySelector('#files'))
monaco.editor.onDidCreateModel(model => {
  const path = model.uri.path
  const anchor = document.createElement('a')
  anchor.id = path
  anchor.href = `#${path}`
  anchor.textContent = path.slice(1)
  fileTree.append(anchor)
})

const rootUri = monaco.Uri.parse('file:///')

/**
 * @param {string} path
 * @param {string} value
 */
function createFile(path, value) {
  const uri = monaco.Uri.joinPath(rootUri, path)
  monaco.editor.createModel(value, undefined, uri)
}

const context =
  /** @type {(path: string) => __WebpackModuleApi.RequireContext} */ (
    import.meta.webpackContext
  )('../../test')

for (const key of context.keys().sort()) {
  createFile(key, context(key))
}

const element = /** @type {HTMLDivElement} */ (
  document.querySelector('#editor')
)

function getModel() {
  const hash = window.location.hash.slice(1)
  const models = monaco.editor.getModels()
  let mdxModel
  for (const model of models) {
    if (model.uri.path === hash) {
      return model
    }
    if (model.uri.path.endsWith('.mdx')) {
      mdxModel = model
    }
  }
  return /** @type {monaco.editor.ITextModel} */ (mdxModel)
}

const editor = monaco.editor.create(element, {
  automaticLayout: true,
  model: getModel(),
  suggest: { showWords: false },
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
      location.hash = input.resource.path
    }

    return result
  }
