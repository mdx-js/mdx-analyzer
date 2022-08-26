import { createMDXLanguageService } from '@mdx-js/language-service'
import {
  createConnection,
  ProposedFeatures,
  TextDocuments,
  TextDocumentSyncKind,
} from 'vscode-languageserver/node.js'
import { TextDocument } from 'vscode-languageserver-textdocument'

const connection = createConnection(ProposedFeatures.all)
const documents = new TextDocuments(TextDocument)
const languageService = createMDXLanguageService()

connection.onInitialize(() => {
  languageService.initialize()

  return {
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Full,
      definitionProvider: true,
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

connection.listen()
documents.listen(connection)
