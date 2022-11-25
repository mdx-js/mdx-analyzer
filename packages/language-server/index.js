#!/usr/bin/env node
/**
 * @typedef {import('vscode-languageserver').TextDocumentChangeEvent<TextDocument>} TextDocumentChangeEvent
 * @typedef {import('vscode-languageserver-textdocument').TextDocument} TextDocument
 */

import { fileURLToPath } from 'node:url'

import ts from 'typescript'
import {
  createConnection,
  CompletionItemTag,
  MarkupKind,
  ProposedFeatures,
  TextDocumentSyncKind,
  TextEdit,
} from 'vscode-languageserver/node.js'

import {
  convertDiagnostics,
  convertNavigationBarItems,
  convertScriptElementKind,
  createDocumentationString,
  definitionInfoToLocationLinks,
  textSpanToRange,
} from './lib/convert.js'
import { documents, getDocByFileName } from './lib/documents.js'
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
      documentSymbolProvider: { label: 'MDX' },
      foldingRangeProvider: true,
      hoverProvider: true,
      referencesProvider: true,
      renameProvider: {
        prepareProvider: true,
      },
      textDocumentSync: TextDocumentSyncKind.Full,
      typeDefinitionProvider: true,
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

  return definitionInfoToLocationLinks(entries)
})

connection.onTypeDefinition(params => {
  const doc = documents.get(params.textDocument.uri)

  if (!doc) {
    return
  }

  const ls = getOrCreateLanguageService(ts, doc.uri)
  const entries = ls.getTypeDefinitionAtPosition(
    fileURLToPath(doc.uri),
    doc.offsetAt(params.position),
  )

  return definitionInfoToLocationLinks(entries)
})

connection.onDocumentSymbol(params => {
  const doc = documents.get(params.textDocument.uri)

  if (!doc) {
    return
  }

  const ls = getOrCreateLanguageService(ts, doc.uri)
  const navigationBarItems = ls.getNavigationBarItems(fileURLToPath(doc.uri))

  return convertNavigationBarItems(doc, navigationBarItems)
})

connection.onFoldingRanges(params => {
  const doc = documents.get(params.textDocument.uri)

  if (!doc) {
    return
  }

  const ls = getOrCreateLanguageService(ts, doc.uri)
  const outlineSpans = ls.getOutliningSpans(fileURLToPath(doc.uri))

  return outlineSpans.map(span => {
    const start = doc.positionAt(span.textSpan.start)
    const end = doc.positionAt(span.textSpan.start + span.textSpan.length)

    return {
      endCharacter: end.character,
      endLine: end.line,
      startCharacter: start.character,
      startLine: start.line,
    }
  })
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

connection.onPrepareRename(params => {
  const doc = documents.get(params.textDocument.uri)

  if (!doc) {
    return
  }

  const fileName = fileURLToPath(doc.uri)
  const position = doc.offsetAt(params.position)
  const ls = getOrCreateLanguageService(ts, doc.uri)
  const renameInfo = ls.getRenameInfo(fileName, position, {
    allowRenameOfImportPath: false,
  })

  if (renameInfo.canRename) {
    return textSpanToRange(doc, renameInfo.triggerSpan)
  }
})

connection.onRenameRequest(params => {
  const doc = documents.get(params.textDocument.uri)

  if (!doc) {
    return
  }

  const fileName = fileURLToPath(doc.uri)
  const position = doc.offsetAt(params.position)
  const ls = getOrCreateLanguageService(ts, doc.uri)
  const locations = ls.findRenameLocations(fileName, position, false, false)

  if (!locations?.length) {
    return
  }

  /** @type {Record<string, TextEdit[]>} */
  const changes = {}
  for (const location of locations) {
    const doc = getDocByFileName(location.fileName)
    if (!doc) {
      continue
    }
    changes[doc.uri] ||= []
    const textEdits = changes[doc.uri]
    textEdits.push(
      TextEdit.replace(textSpanToRange(doc, location.textSpan), params.newName),
    )
  }
  return { changes }
})

documents.onDidClose(event => {
  connection.sendDiagnostics({ uri: event.document.uri, diagnostics: [] })
})

/**
 * @param {TextDocumentChangeEvent} event
 */
function checkDiagnostics(event) {
  const { uri } = event.document
  const path = fileURLToPath(uri)
  const ls = getOrCreateLanguageService(ts, uri)
  const diagnostics = [
    ...ls.getSemanticDiagnostics(path),
    ...ls.getSuggestionDiagnostics(path),
    ...ls.getSyntacticDiagnostics(path),
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
