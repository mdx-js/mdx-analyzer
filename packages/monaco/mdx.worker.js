/**
 * @typedef {import('vscode-languageserver-types').LocationLink} LocationLink
 * @typedef {import('vscode-languageserver-types').Position} Position
 * @typedef {object} MDXWorker
 * @property {(uri: string, position: Position) => LocationLink[]} doLocationLinks
 * Provide document links for the given URI.
 */

import { createMDXLanguageService } from '@mdx-js/language-service'
import { initialize } from 'monaco-worker-manager/worker'
import { TextDocument } from 'vscode-languageserver-textdocument'

initialize(ctx => {
  const languageService = createMDXLanguageService()

  /**
   * @param {string} uri The URI to get a text document for.
   * @returns {TextDocument | undefined} The text
   * document that matches the URI.
   */
  function getTextDocument(uri) {
    for (const model of ctx.getMirrorModels()) {
      if (String(model.uri) === uri) {
        return TextDocument.create(uri, 'mdx', model.version, model.getValue())
      }
    }
  }

  return /** @type {MDXWorker} */ ({
    doLocationLinks(uri, position) {
      const doc = getTextDocument(uri)

      if (!doc) {
        return []
      }

      return languageService.doLocationLinks(doc, position)
    },
  })
})
