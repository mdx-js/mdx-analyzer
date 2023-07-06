/***
 * @typedef {import('monaco-editor')} Monaco
 * @typedef {import('monaco-editor').IDisposable} IDisposable
 * @typedef {import('monaco-editor').Uri} Uri
 * @typedef {import('monaco-editor').editor.ITextModel} ITextModel
 * @typedef {import('monaco-editor').editor.MonacoWebWorker<TypeScriptWorker>} MonacoWebWorker
 * @typedef {import('monaco-editor').languages.typescript.TypeScriptWorker} TypeScriptWorker
 * @typedef {Partial<import('./mdx.worker.js').CreateData>} CreateData
 *
 * @typedef InitializeMonacoMdxOptions
 * @property {CreateData} createData
 *   Options to pass to the MDX worker.
 */

import {registerMarkerDataProvider} from 'monaco-marker-data-provider'
import {
  createCompletionItemProvider,
  createDefinitionProvider,
  createHoverProvider,
  createMarkerDataProvider,
  createReferenceProvider
} from './lib/language-features.js'

/**
 * Initialize MDX IntelliSense for MDX.
 *
 * @param {Monaco} monaco
 *   The Monaco editor module.
 * @param {InitializeMonacoMdxOptions} [options]
 *   Additional options for MDX IntelliSense.
 * @returns {IDisposable}
 *   A disposable.
 */
export function initializeMonacoMdx(monaco, options) {
  const worker = /** @type {MonacoWebWorker} */ (
    monaco.editor.createWebWorker({
      moduleId: '@mdx-js/monaco',
      label: 'mdx',
      keepIdleModels: true,
      createData: /** @type {CreateData} */ ({
        compilerOptions: options?.createData?.compilerOptions || {},
        extraLibs: options?.createData?.extraLibs || {},
        inlayHintsOptions: options?.createData?.inlayHintsOptions || {}
      })
    })
  )

  /**
   * @param {Uri[]} resources
   */
  const getProxy = (...resources) => worker.withSyncedResources(resources)

  /**
   * Synchronize all MDX, JavaScript, and TypeScript files with the web worker.
   *
   * @param {ITextModel} model
   */
  const synchronize = (model) => {
    const languageId = model.getLanguageId()
    if (
      languageId === 'mdx' ||
      languageId === 'javascript' ||
      languageId === 'javascriptreact' ||
      languageId === 'typescript' ||
      languageId === 'typescriptreact'
    ) {
      getProxy(model.uri)
    }
  }

  monaco.editor.onDidChangeModelLanguage(({model}) => {
    synchronize(model)
  })

  const disposables = [
    worker,
    monaco.editor.onDidCreateModel(synchronize),
    monaco.languages.registerCompletionItemProvider(
      'mdx',
      createCompletionItemProvider(monaco, getProxy)
    ),
    monaco.languages.registerDefinitionProvider(
      'mdx',
      createDefinitionProvider(monaco, getProxy)
    ),
    monaco.languages.registerHoverProvider(
      'mdx',
      createHoverProvider(monaco, getProxy)
    ),
    monaco.languages.registerReferenceProvider(
      'mdx',
      createReferenceProvider(monaco, getProxy)
    ),
    registerMarkerDataProvider(
      monaco,
      'mdx',
      createMarkerDataProvider(monaco, getProxy)
    )
  ]

  return {
    dispose() {
      for (const disposable of disposables) {
        disposable.dispose()
      }
    }
  }
}
