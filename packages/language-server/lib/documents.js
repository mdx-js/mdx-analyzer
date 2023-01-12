import {pathToFileURL} from 'node:url'

import {TextDocuments} from 'vscode-languageserver'
import {TextDocument} from 'vscode-languageserver-textdocument'

/**
 * The global text documents manager.
 */
export const documents = new TextDocuments(TextDocument)

/**
 * Return a document based on its file name.
 *
 * Documents are stored using a file URL. This function allows to do a lookup by file name instead.
 *
 * @param {string } fileName
 *   The file name to lookup.
 * @returns {TextDocument | undefined}
 *   The text document that matches the filename.
 */
export function getDocByFileName(fileName) {
  return documents.get(String(pathToFileURL(fileName)))
}
