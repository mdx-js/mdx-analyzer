import {registerMarkerDataProvider} from 'monaco-marker-data-provider'

import {
  createCompletionItemProvider,
  createDefinitionProvider,
  createHoverProvider,
  createMarkerDataProvider,
  createReferenceProvider
} from './lib/language-features.js'

/**
 * @param {string} languageId
 */
function shouldSynchronize(languageId) {
  return (
    languageId === 'mdx' ||
    languageId === 'javascript' ||
    languageId === 'javascriptreact' ||
    languageId === 'typescript' ||
    languageId === 'typescriptreact'
  )
}

/**
 * Initialize MDX intellisense for MDX.
 *
 * @param {typeof import('monaco-editor')} monaco The Monaco editor module.
 * @returns {import('monaco-editor').IDisposable} A disposable.
 */
export function initializeMonacoMDX(monaco) {
  const worker =
    /** @type {import('monaco-editor').editor.MonacoWebWorker<import('monaco-editor').languages.typescript.TypeScriptWorker>} */ (
      monaco.editor.createWebWorker({
        moduleId: '@mdx-js/monaco',
        label: 'mdx',
        keepIdleModels: true,
        createData: /** @type {import('./mdx.override.js').CreateData} */ ({
          compilerOptions: {},
          extraLibs: {},
          inlayHintsOptions: {}
        })
      })
    )

  /**
   * @param {import('monaco-editor').Uri[]} resources
   */
  const getProxy = (...resources) => worker.withSyncedResources(resources)

  /**
   * Synchronize all MDX, JavaScript, and TypeScript files with the web worker.
   *
   * @param {import('monaco-editor').editor.ITextModel} model
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
