/**
 * @typedef {import('@mdx-js/language-service').MDXLanguageService} MDXLanguageService
 */

import { createMDXLanguageService } from '@mdx-js/language-service'
import ts from 'typescript/lib/tsserverlibrary.js'
import {
  createConnection,
  ProposedFeatures,
  TextDocuments,
  TextDocumentSyncKind,
} from 'vscode-languageserver/node.js'
import { TextDocument } from 'vscode-languageserver-textdocument'

const connection = createConnection(ProposedFeatures.all)
const documents = new TextDocuments(TextDocument)
/** @type {MDXLanguageService} */
let languageService

connection.onInitialize(() => {
  languageService = createMDXLanguageService({
    ts: ts.createLanguageService({
      readFile(filename) {
        return ts.sys.readFile(filename)
      },
      writeFile: ts.sys.writeFile,
      directoryExists: ts.sys.directoryExists,
      getDirectories: ts.sys.getDirectories,
      readDirectory: ts.sys.readDirectory,
      realpath: ts.sys.realpath,
      fileExists(filename) {
        return ts.sys.fileExists(filename)
      },
      getCompilationSettings() {
        return {
          allowJs: true,
          jsx: ts.JsxEmit.Preserve,
          allowNonTsExtensions: true,
        }
      },
      getCurrentDirectory() {
        return process.cwd()
      },
      getDefaultLibFileName: ts.getDefaultLibFilePath,
      getScriptFileNames: () =>
        documents.keys().map(url => new URL(url).pathname),
      getScriptKind(filename) {
        if (filename.endsWith('.mdx')) {
          return ts.ScriptKind.JSX
        }
        // @ts-expect-error This function is internal, but it exists.
        return ts.ensureScriptKind(filename)
      },
      getScriptSnapshot(filename) {
        const doc = documents.get(`file://${filename}`)

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
    }),
  })

  return {
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Full,
      definitionProvider: true,
      hoverProvider: true,
    },
  }
})

connection.onDefinition(params => {
  const doc = documents.get(params.textDocument.uri)

  if (!doc) {
    return []
  }

  return languageService.doLocationLinks(doc, params.position)
})

connection.onHover(params => {
  const doc = documents.get(params.textDocument.uri)

  if (!doc) {
    return
  }

  return languageService.doHover(doc, params.position)
})

connection.listen()
documents.listen(connection)
