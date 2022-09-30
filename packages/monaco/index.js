import {
  createDefinitionProvider,
  createHoverProvider,
} from './lib/language-features.js'

/**
 * Initialize MDX intellisense for MDX.
 *
 * @param {typeof import('monaco-editor')} monaco The Monaco editor module.
 * @returns {import('monaco-editor').IDisposable} A disposable.
 */
export function initializeMonacoMDX(monaco) {
  const disposables = [
    monaco.languages.registerDefinitionProvider(
      'mdx',
      createDefinitionProvider(monaco),
    ),
    monaco.languages.registerHoverProvider('mdx', createHoverProvider(monaco)),
  ]

  return {
    dispose() {
      for (const disposable of disposables) {
        disposable.dispose()
      }
    },
  }
}
