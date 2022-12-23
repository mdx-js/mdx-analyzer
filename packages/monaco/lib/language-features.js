/**
 * @typedef {import('monaco-editor')} Monaco
 * @typedef {import('monaco-editor').languages.CompletionItemProvider} CompletionItemProvider
 * @typedef {import('monaco-editor').languages.DefinitionProvider} DefinitionProvider
 * @typedef {import('monaco-editor').languages.HoverProvider} HoverProvider
 * @typedef {import('monaco-editor').languages.Location} Location
 * @typedef {import('monaco-editor').languages.ReferenceProvider} ReferenceProvider
 * @typedef {import('monaco-editor').languages.typescript.TypeScriptWorker} TypeScriptWorker
 * @typedef {import('monaco-editor').Uri} Uri
 * @typedef {import('monaco-marker-data-provider').MarkerDataProvider} MarkerDataProvider
 *
 * @typedef {(...resources: Uri[]) => Promise<TypeScriptWorker>} GetWorker
 */

import {
  convertDiagnostics,
  convertScriptElementKind,
  createDocumentationString,
  displayPartsToString,
  tagToString,
  textSpanToRange
} from './convert.js'

/**
 * @param {Monaco} monaco
 * @param {GetWorker} getWorker
 * @returns {CompletionItemProvider} A completion item provider for MDX documents.
 */
export function createCompletionItemProvider(monaco, getWorker) {
  return {
    async provideCompletionItems(model, position) {
      const worker = await getWorker(model.uri)
      const offset = model.getOffsetAt(position)
      const wordInfo = model.getWordUntilPosition(position)
      const wordRange = new monaco.Range(
        position.lineNumber,
        wordInfo.startColumn,
        position.lineNumber,
        wordInfo.endColumn
      )

      if (model.isDisposed()) {
        return
      }

      const info = /** @type {ts.CompletionInfo | undefined} */ (
        await worker.getCompletionsAtPosition(String(model.uri), offset)
      )

      if (!info || model.isDisposed()) {
        return
      }

      const suggestions = info.entries.map((entry) => {
        const range = entry.replacementSpan
          ? textSpanToRange(model, entry.replacementSpan)
          : wordRange

        const tags = entry.kindModifiers?.includes('deprecated')
          ? [monaco.languages.CompletionItemTag.Deprecated]
          : []

        return {
          uri: model.uri,
          position,
          offset,
          range,
          label: entry.name,
          insertText: entry.name,
          sortText: entry.sortText,
          kind: convertScriptElementKind(monaco, entry.kind),
          tags
        }
      })

      return {
        suggestions
      }
    },

    async resolveCompletionItem(item) {
      const {label, offset, uri} = /** @type {any} */ (item)

      const worker = await getWorker(uri)

      const details = /** @type {ts.CompletionEntryDetails | undefined} */ (
        await worker.getCompletionEntryDetails(String(uri), offset, label)
      )

      if (!details) {
        return item
      }

      return {
        ...item,
        label: details.name,
        kind: convertScriptElementKind(monaco, details.kind),
        detail: displayPartsToString(details.displayParts),
        documentation: {
          value: createDocumentationString(details)
        }
      }
    }
  }
}

/**
 * @param {Monaco} monaco
 * @param {GetWorker} getWorker
 * @returns {HoverProvider} A hover provider for MDX documents.
 */
export function createHoverProvider(monaco, getWorker) {
  return {
    async provideHover(model, position) {
      const worker = await getWorker(model.uri)

      /** @type {ts.QuickInfo | undefined} */
      const info = await worker.getQuickInfoAtPosition(
        String(model.uri),
        model.getOffsetAt(position)
      )

      if (!info) {
        return
      }

      const documentation = displayPartsToString(info.documentation)
      const tags = info.tags
        ? info.tags.map((tag) => tagToString(tag)).join('  \n\n')
        : ''
      const contents = displayPartsToString(info.displayParts)

      return {
        range: textSpanToRange(model, info.textSpan),
        contents: [
          {
            value: '```typescript\n' + contents + '\n```\n'
          },
          {
            value: documentation + (tags ? '\n\n' + tags : '')
          }
        ]
      }
    }
  }
}

/**
 * @param {Monaco} monaco
 * @param {GetWorker} getWorker
 * @returns {DefinitionProvider} A link provider for MDX documents.
 */
export function createDefinitionProvider(monaco, getWorker) {
  return {
    async provideDefinition(model, position) {
      const worker = await getWorker(model.uri)

      const offset = model.getOffsetAt(position)
      const entries = /** @type {ts.ReferenceEntry[] | undefined} */ (
        await worker.getDefinitionAtPosition(String(model.uri), offset)
      )
      if (!entries?.length) {
        return
      }

      /** @type {Location[]} */
      const result = []
      for (const entry of entries) {
        const uri = monaco.Uri.parse(entry.fileName)
        const refModel = monaco.editor.getModel(uri)
        if (refModel) {
          result.push({
            uri,
            range: textSpanToRange(model, entry.textSpan)
          })
        }
      }

      return result
    }
  }
}

/**
 * @param {Monaco} monaco
 * @param {GetWorker} getWorker
 * @returns {MarkerDataProvider} A reference provider for MDX documents.
 */
export function createMarkerDataProvider(monaco, getWorker) {
  return {
    owner: 'mdx',

    async provideMarkerData(model) {
      const worker = await getWorker(model.uri)
      const uri = String(model.uri)
      const diagnostics = await Promise.all([
        worker.getSemanticDiagnostics(uri),
        worker.getSuggestionDiagnostics(uri),
        worker.getSyntacticDiagnostics(uri)
      ])

      if (model.isDisposed()) {
        return
      }

      return diagnostics
        .flat()
        .map((diagnostic) => convertDiagnostics(monaco, model, diagnostic))
    }
  }
}

/**
 * @param {Monaco} monaco
 * @param {GetWorker} getWorker
 * @returns {ReferenceProvider} A reference provider for MDX documents.
 */
export function createReferenceProvider(monaco, getWorker) {
  return {
    async provideReferences(model, position) {
      const worker = await getWorker(model.uri)
      const resource = model.uri
      const offset = model.getOffsetAt(position)

      if (model.isDisposed()) {
        return
      }

      const entries = /** @type {ts.ReferenceEntry[] | undefined} */ (
        await worker.getReferencesAtPosition(resource.toString(), offset)
      )

      if (!entries || model.isDisposed()) {
        return
      }

      /** @type {Location[]} */
      const result = []
      for (const entry of entries) {
        const uri = monaco.Uri.parse(entry.fileName)
        const refModel = monaco.editor.getModel(uri)
        if (refModel) {
          result.push({
            uri: refModel.uri,
            range: textSpanToRange(refModel, entry.textSpan)
          })
        }
      }

      return result
    }
  }
}
