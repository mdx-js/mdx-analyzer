/***
 * @typedef {import('monaco-editor')} Monaco
 * @typedef {import('monaco-editor').IDisposable} IDisposable
 * @typedef {import('monaco-editor').Uri} Uri
 * @typedef {import('monaco-editor').editor.ITextModel} ITextModel
 * @typedef {import('monaco-editor').editor.MonacoWebWorker<TypeScriptWorker>} MonacoWebWorker
 * @typedef {import('monaco-editor').languages.typescript.TypeScriptWorker} TypeScriptWorker
 */

import * as volar from '@volar/monaco'

/**
 * Initialize MDX IntelliSense for MDX.
 *
 * @param {Monaco} monaco
 * @returns {Promise<IDisposable>}
 *   A disposable.
 */
export async function initializeMonacoMdx(monaco) {
  const worker = monaco.editor.createWebWorker({
    moduleId: '@mdx-js/monaco/mdx.worker.js',
    label: 'mdx'
  })

  const provides = await volar.languages.registerProvides(
    worker,
    'mdx',
    () => monaco.editor.getModels().map((model) => model.uri),
    monaco.languages
  )

  return {
    dispose() {
      provides.disposw()
      worker.dispose()
    }
  }
}
