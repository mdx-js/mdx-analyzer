/**
 * @typedef {import('vscode-languageserver-textdocument').TextDocument} TextDocument
 * @typedef {import('vscode-languageserver-types').LocationLink} LocationLink
 * @typedef {import('vscode-languageserver-types').Position} Position
 * @typedef {object} MDXLanguageService
 * @property {() => void} initialize
 * Initialize the language service.
 * @property {(document: TextDocument, position: Position) => LocationLink[]} doLocationLinks
 * Provide document links
 */

import remarkMdx from 'remark-mdx'
import remarkParse from 'remark-parse'
import { unified } from 'unified'

import { provideLocationLinks } from './location-links.js'

/**
 * Create an MDX language service
 *
 * @returns {MDXLanguageService} The MDX language service.
 */
export function createMDXLanguageService() {
  const processor = unified().use(remarkParse).use(remarkMdx)

  return {
    // eslint-disable-next-line no-empty-function
    initialize() {},
    doLocationLinks: (document, position) =>
      provideLocationLinks(document, position, processor),
  }
}
