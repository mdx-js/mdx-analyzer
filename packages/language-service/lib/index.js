/**
 * @typedef {import('typescript').LanguageService} TSLanguageService
 * @typedef {import('vscode-languageserver-textdocument').TextDocument} TextDocument
 * @typedef {import('vscode-languageserver-types').Hover} Hover
 * @typedef {import('vscode-languageserver-types').LocationLink} LocationLink
 * @typedef {import('vscode-languageserver-types').Position} Position
 */

/**
 * @typedef {object} MDXLanguageServiceOptions
 * @property {TSLanguageService} ts
 * The TypeScript language service.
 */

/**
 * @typedef {object} MDXLanguageService
 * @property {(document: TextDocument, position: Position) => LocationLink[]} doLocationLinks
 * Provide document links
 * @property {(document: TextDocument, position: Position) => Hover | undefined} doHover
 * Provide document hovers
 */

import remarkMdx from 'remark-mdx'
import remarkParse from 'remark-parse'
import { unified } from 'unified'

import { provideLocationLinks } from './location-links.js'
import { provideHover } from './provide-hover.js'

/**
 * Create an MDX language service
 *
 * @param {MDXLanguageServiceOptions} options
 * @returns {MDXLanguageService} The MDX language service.
 */
export function createMDXLanguageService(options) {
  const processor = unified().use(remarkParse).use(remarkMdx)

  return {
    doLocationLinks: (document, position) =>
      provideLocationLinks(document, position, processor),
    doHover: (document, position) =>
      provideHover(options.ts, document, position),
  }
}
