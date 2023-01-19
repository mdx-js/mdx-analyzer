#!/usr/bin/env node
/**
 * @typedef {import('vscode-languageserver').TextDocumentChangeEvent<TextDocument>} TextDocumentChangeEvent
 * @typedef {import('vscode-languageserver-textdocument').TextDocument} TextDocument
 */

import process from 'node:process'
import {fileURLToPath} from 'node:url'

import ts from 'typescript'
import {
  createConnection,
  CompletionItemTag,
  MarkupKind,
  ProposedFeatures,
  TextDocumentSyncKind,
  TextEdit
} from 'vscode-languageserver/node.js'

import {
  convertDiagnostics,
  convertNavigationBarItems,
  convertScriptElementKind,
  createDocumentationString,
  definitionInfoToLocationLinks,
  textSpanToRange
} from './lib/convert.js'
import {documents, getDocByFileName, getMdxDoc} from './lib/documents.js'
import {getOrCreateLanguageService} from './lib/language-service-manager.js'

process.title = 'mdx-language-server'

const connection = createConnection(ProposedFeatures.all)

connection.onInitialize(() => {
  return {
    capabilities: {
      completionProvider: {
        completionItem: {
          labelDetailsSupport: true
        },
        resolveProvider: true
      },
      definitionProvider: true,
      documentSymbolProvider: {label: 'MDX'},
      foldingRangeProvider: true,
      hoverProvider: true,
      referencesProvider: true,
      renameProvider: {
        prepareProvider: true
      },
      textDocumentSync: TextDocumentSyncKind.Full,
      typeDefinitionProvider: true
    }
  }
})

connection.onCompletion((parameters) => {
  const doc = getMdxDoc(parameters.textDocument.uri)

  if (!doc) {
    return
  }

  const offset = doc.offsetAt(parameters.position)
  const ls = getOrCreateLanguageService(ts, doc.uri)
  const info = ls.getCompletionsAtPosition(fileURLToPath(doc.uri), offset, {
    triggerKind: parameters.context?.triggerKind,
    triggerCharacter: /** @type {ts.CompletionsTriggerCharacter} */ (
      parameters.context?.triggerCharacter
    )
  })

  if (!info) {
    return
  }

  return {
    isIncomplete: Boolean(info.isIncomplete),
    items: info.entries.map((entry) => ({
      data: {
        data: entry.data,
        offset,
        source: entry.source,
        uri: doc.uri
      },
      insertText: entry.name,
      kind: convertScriptElementKind(entry.kind),
      label: entry.name,
      sortText: entry.sortText,
      source: entry.source,
      tags: entry.kindModifiers?.includes('deprecated')
        ? [CompletionItemTag.Deprecated]
        : []
    }))
  }
})

connection.onCompletionResolve((parameters) => {
  const {data, offset, source, uri} = parameters.data

  const doc = getMdxDoc(uri)

  if (!doc) {
    return parameters
  }

  const ls = getOrCreateLanguageService(ts, uri)
  const details = ls.getCompletionEntryDetails(
    fileURLToPath(uri),
    offset,
    parameters.label,
    undefined,
    source,
    undefined,
    data
  )

  return {
    ...parameters,
    detail: details?.displayParts
      ? ts.displayPartsToString(details.displayParts)
      : undefined,
    documentation: details
      ? {
          kind: MarkupKind.Markdown,
          value: createDocumentationString(ts, details)
        }
      : undefined,
    kind: details?.kind ? convertScriptElementKind(details.kind) : undefined,
    label: details?.name ?? parameters.label
  }
})

connection.onDefinition((parameters) => {
  const doc = getMdxDoc(parameters.textDocument.uri)

  if (!doc) {
    return
  }

  const ls = getOrCreateLanguageService(ts, doc.uri)
  const entries = ls.getDefinitionAtPosition(
    fileURLToPath(doc.uri),
    doc.offsetAt(parameters.position)
  )

  return definitionInfoToLocationLinks(entries)
})

connection.onTypeDefinition((parameters) => {
  const doc = getMdxDoc(parameters.textDocument.uri)

  if (!doc) {
    return
  }

  const ls = getOrCreateLanguageService(ts, doc.uri)
  const entries = ls.getTypeDefinitionAtPosition(
    fileURLToPath(doc.uri),
    doc.offsetAt(parameters.position)
  )

  return definitionInfoToLocationLinks(entries)
})

connection.onDocumentSymbol((parameters) => {
  const doc = getMdxDoc(parameters.textDocument.uri)

  if (!doc) {
    return
  }

  const ls = getOrCreateLanguageService(ts, doc.uri)
  const navigationBarItems = ls.getNavigationBarItems(fileURLToPath(doc.uri))

  return convertNavigationBarItems(doc, navigationBarItems)
})

connection.onFoldingRanges((parameters) => {
  const doc = getMdxDoc(parameters.textDocument.uri)

  if (!doc) {
    return
  }

  const ls = getOrCreateLanguageService(ts, doc.uri)
  const outlineSpans = ls.getOutliningSpans(fileURLToPath(doc.uri))

  return outlineSpans.map((span) => {
    const start = doc.positionAt(span.textSpan.start)
    const end = doc.positionAt(span.textSpan.start + span.textSpan.length)

    return {
      endCharacter: end.character,
      endLine: end.line,
      startCharacter: start.character,
      startLine: start.line
    }
  })
})

connection.onHover((parameters) => {
  const doc = getMdxDoc(parameters.textDocument.uri)

  if (!doc) {
    return
  }

  const ls = getOrCreateLanguageService(ts, doc.uri)
  const info = ls.getQuickInfoAtPosition(
    fileURLToPath(doc.uri),
    doc.offsetAt(parameters.position)
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
        createDocumentationString(ts, info)
    }
  }
})

connection.onReferences((parameters) => {
  const doc = getMdxDoc(parameters.textDocument.uri)

  if (!doc) {
    return
  }

  const ls = getOrCreateLanguageService(ts, doc.uri)
  const entries = ls.getReferencesAtPosition(
    fileURLToPath(doc.uri),
    doc.offsetAt(parameters.position)
  )

  return entries?.map((entry) => ({
    uri: entry.fileName,
    range: textSpanToRange(doc, entry.textSpan)
  }))
})

connection.onPrepareRename((parameters) => {
  const doc = getMdxDoc(parameters.textDocument.uri)

  if (!doc) {
    return
  }

  const fileName = fileURLToPath(doc.uri)
  const position = doc.offsetAt(parameters.position)
  const ls = getOrCreateLanguageService(ts, doc.uri)
  const renameInfo = ls.getRenameInfo(fileName, position, {
    allowRenameOfImportPath: false
  })

  if (renameInfo.canRename) {
    return textSpanToRange(doc, renameInfo.triggerSpan)
  }
})

connection.onRenameRequest((parameters) => {
  const doc = getMdxDoc(parameters.textDocument.uri)

  if (!doc) {
    return
  }

  const fileName = fileURLToPath(doc.uri)
  const position = doc.offsetAt(parameters.position)
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
      TextEdit.replace(
        textSpanToRange(doc, location.textSpan),
        parameters.newName
      )
    )
  }

  return {changes}
})

documents.onDidClose((event) => {
  connection.sendDiagnostics({uri: event.document.uri, diagnostics: []})
})

/**
 * @param {TextDocumentChangeEvent} event
 */
function checkDiagnostics(event) {
  const {uri} = event.document
  const path = fileURLToPath(uri)
  const ls = getOrCreateLanguageService(ts, uri)
  const diagnostics = [
    ...ls.getSemanticDiagnostics(path),
    ...ls.getSuggestionDiagnostics(path),
    ...ls.getSyntacticDiagnostics(path)
  ]

  connection.sendDiagnostics({
    uri,
    diagnostics: diagnostics.map((diag) =>
      convertDiagnostics(ts, event.document, diag)
    )
  })
}

documents.onDidChangeContent(checkDiagnostics)

documents.onDidOpen(checkDiagnostics)

connection.listen()
documents.listen(connection)
