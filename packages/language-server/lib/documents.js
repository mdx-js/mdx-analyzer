import { TextDocuments } from 'vscode-languageserver'
import { TextDocument } from 'vscode-languageserver-textdocument'

/**
 * The global text documents manager.
 */
export const documents = new TextDocuments(TextDocument)
