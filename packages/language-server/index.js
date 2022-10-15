/**
 * @typedef {import('vscode-languageserver').TextDocumentChangeEvent<TextDocument>} TextDocumentChangeEvent
 * @typedef {import('vscode-languageserver-textdocument').TextDocument} TextDocument
 */

import { fileURLToPath } from 'node:url'

import ts from 'typescript'
import {
  createConnection,
  CompletionItemTag,
  LocationLink,
  MarkupKind,
  ProposedFeatures,
  TextDocumentSyncKind,
} from 'vscode-languageserver/node.js'

import {
  convertDiagnostics,
  convertScriptElementKind,
  createDocumentationString,
  textSpanToRange,
} from './lib/convert.js'
import { documents } from './lib/documents.js'
import { getOrCreateLanguageService } from './lib/language-service-manager.js'

const connection = createConnection(ProposedFeatures.all)

connection.onInitialize(() => {
  return {
    capabilities: {
      completionProvider: {
        completionItem: {
          labelDetailsSupport: true,
        },
        resolveProvider: true,
      },
      definitionProvider: true,
      hoverProvider: true,
      referencesProvider: true,
      textDocumentSync: TextDocumentSyncKind.Full,
    },
  }
})

connection.onCompletion(params => {
  const doc = documents.get(params.textDocument.uri)

  if (!doc) {
    return []
  }

  const offset = doc.offsetAt(params.position)
  const ls = getOrCreateLanguageService(ts, doc.uri)
  const info = ls.getCompletionsAtPosition(fileURLToPath(doc.uri), offset, {
    triggerKind: params.context?.triggerKind,
    triggerCharacter: /** @type {ts.CompletionsTriggerCharacter} */ (
      params.context?.triggerCharacter
    ),
  })

  if (!info) {
    return []
  }

  return {
    isIncomplete: Boolean(info.isIncomplete),
    items: info.entries.map(entry => ({
      data: {
        data: entry.data,
        offset,
        source: entry.source,
        uri: doc.uri,
      },
      insertText: entry.name,
      kind: convertScriptElementKind(entry.kind),
      label: entry.name,
      sortText: entry.sortText,
      source: entry.source,
      tags: entry.kindModifiers?.includes('deprecated')
        ? [CompletionItemTag.Deprecated]
        : [],
    })),
  }
})

connection.onCompletionResolve(params => {
  const { data, offset, source, uri } = params.data

  const doc = documents.get(uri)

  if (!doc) {
    return params
  }

  const ls = getOrCreateLanguageService(ts, uri)
  const details = ls.getCompletionEntryDetails(
    fileURLToPath(uri),
    offset,
    params.label,
    undefined,
    source,
    undefined,
    data,
  )

  return {
    ...params,
    detail: details?.displayParts
      ? ts.displayPartsToString(details.displayParts)
      : undefined,
    documentation: details
      ? {
          kind: MarkupKind.Markdown,
          value: createDocumentationString(ts, details),
        }
      : undefined,
    kind: details?.kind ? convertScriptElementKind(details.kind) : undefined,
    label: details?.name ?? params.label,
  }
})

connection.onDefinition(params => {
  const doc = documents.get(params.textDocument.uri)

  if (!doc) {
    return
  }

  const ls = getOrCreateLanguageService(ts, doc.uri)
  const entries = ls.getDefinitionAtPosition(
    fileURLToPath(doc.uri),
    doc.offsetAt(params.position),
  )

  if (!entries) {
    return
  }

  /** @type {LocationLink[]} */
  const result = []
  for (const entry of entries) {
    if (entry.fileName === doc.uri) {
      result.push(
        LocationLink.create(
          entry.fileName,
          textSpanToRange(doc, entry.textSpan),
          textSpanToRange(doc, entry.textSpan),
        ),
      )
    }
  }
  return result
})

connection.onHover(params => {
  const doc = documents.get(params.textDocument.uri)

  if (!doc) {
    return
  }

  const ls = getOrCreateLanguageService(ts, doc.uri)
  const info = ls.getQuickInfoAtPosition(
    fileURLToPath(doc.uri),
    doc.offsetAt(params.position),
  )

  if (!info) {
    return
  }

  const contents = ts.displayPartsToString(info.displayParts)

  return {
    range: textSpanToRange(doc, info.textSpan),
    contents: {
      kind: MarkupKind.Markdown,
      value:
        '```typescript\n' +
        contents +
        '\n```\n' +
        createDocumentationString(ts, info),
    },
  }
})

connection.onReferences(params => {
  const doc = documents.get(params.textDocument.uri)

  if (!doc) {
    return
  }

  const ls = getOrCreateLanguageService(ts, doc.uri)
  const entries = ls.getReferencesAtPosition(
    fileURLToPath(doc.uri),
    doc.offsetAt(params.position),
  )

  return entries?.map(entry => ({
    uri: entry.fileName,
    range: textSpanToRange(doc, entry.textSpan),
  }))
})

documents.onDidClose(event => {
  connection.sendDiagnostics({ uri: event.document.uri, diagnostics: [] })
})

/**
 * @param {TextDocumentChangeEvent} event
 */
function checkDiagnostics(event) {
  const { uri } = event.document
  const ls = getOrCreateLanguageService(ts, uri)
  const diagnostics = [
    ...ls.getSemanticDiagnostics(fileURLToPath(uri)),
    ...ls.getSuggestionDiagnostics(fileURLToPath(uri)),
  ]

  connection.sendDiagnostics({
    uri,
    diagnostics: diagnostics.map(diag =>
      convertDiagnostics(ts, event.document, diag),
    ),
  })
}

documents.onDidChangeContent(checkDiagnostics)

documents.onDidOpen(checkDiagnostics)

connection.listen()
documents.listen(connection)
