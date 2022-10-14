/**
 * @typedef {import('vscode-languageserver').TextDocumentChangeEvent<TextDocument>} TextDocumentChangeEvent
 * @typedef {import('vscode-languageserver-textdocument').TextDocument} TextDocument
 */

import { createMDXLanguageService } from '@mdx-js/language-service'
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
  displayPartsToString,
  tagToString,
  textSpanToRange,
} from './lib/convert.js'
import { documents } from './lib/documents.js'

const connection = createConnection(ProposedFeatures.all)
/** @type {ts.LanguageService} */
let ls

connection.onInitialize(() => {
  ls = createMDXLanguageService(ts, {
    readFile: ts.sys.readFile,
    writeFile: ts.sys.writeFile,
    directoryExists: ts.sys.directoryExists,
    getDirectories: ts.sys.getDirectories,
    readDirectory: ts.sys.readDirectory,
    realpath: ts.sys.realpath,
    fileExists: ts.sys.fileExists,
    getCompilationSettings() {
      return {}
    },
    getCurrentDirectory() {
      return process.cwd()
    },
    getDefaultLibFileName: ts.getDefaultLibFilePath,
    getScriptFileNames: () => documents.keys(),
    getScriptSnapshot(fileName) {
      const doc = documents.get(fileName)

      if (!doc) {
        return
      }

      return ts.ScriptSnapshot.fromString(doc.getText())
    },
    getScriptVersion(filename) {
      const doc = documents.get(filename)

      return String(doc?.version)
    },
    useCaseSensitiveFileNames: () => ts.sys.useCaseSensitiveFileNames,
  })

  return {
    capabilities: {
      completionProvider: {
        completionItem: {
          labelDetailsSupport: true,
        },
        resolveProvider: true,
      },
      definitionProvider: true,
      // diagnosticProvider: {
      //   documentSelector: [],
      // },
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

  const info = ls.getCompletionsAtPosition(doc.uri, offset, {
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

  const details = ls.getCompletionEntryDetails(
    uri,
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
      ? displayPartsToString(details.displayParts)
      : undefined,
    documentation: details
      ? { kind: MarkupKind.Markdown, value: createDocumentationString(details) }
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

  const entries = ls.getDefinitionAtPosition(
    doc.uri,
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

  const info = ls.getQuickInfoAtPosition(doc.uri, doc.offsetAt(params.position))

  if (!info) {
    return
  }

  const documentation = displayPartsToString(info.documentation)
  const tags = info.tags
    ? info.tags.map(tag => tagToString(tag)).join('  \n\n')
    : ''
  const contents = displayPartsToString(info.displayParts)

  return {
    range: textSpanToRange(doc, info.textSpan),
    contents: {
      kind: MarkupKind.Markdown,
      value:
        '```typescript\n' +
        contents +
        '\n```\n' +
        documentation +
        (tags ? '\n\n' + tags : ''),
    },
  }
})

connection.onReferences(params => {
  const doc = documents.get(params.textDocument.uri)

  if (!doc) {
    return
  }

  const entries = ls.getReferencesAtPosition(
    doc.uri,
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

  const diagnostics = [
    ...ls.getSemanticDiagnostics(uri),
    ...ls.getSuggestionDiagnostics(uri),
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
