import { createWorkerManager } from 'monaco-worker-manager'

import { createLinkProvider } from './lib/language-features.js'

/**
 * Initialize MDX intellisense for MDX.
 *
 * @param {typeof import('monaco-editor')} monaco The Monaco editor  module.
 * @returns {import('monaco-editor').IDisposable} A disposable.
 */
export function initializeMonacoMDX(monaco) {
  /**
   * @type {import('monaco-worker-manager').WorkerManager<import('@mdx-js/language-service').MDXLanguageService>}
   */
  const worker = createWorkerManager(monaco, {
    label: 'mdx',
    moduleId: '@mdx-js/monaco',
  })

  const disposables = [
    worker,
    monaco.languages.registerDefinitionProvider(
      'mdx',
      createLinkProvider(monaco, worker.getWorker),
    ),
  ]

  return {
    dispose() {
      for (const disposable of disposables) {
        disposable.dispose()
      }
    },
  }
}
