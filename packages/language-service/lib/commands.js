/**
 * @typedef {import('@volar/language-service').Range} Range
 * @typedef {import('@volar/language-service').ServiceContext} ServiceContext
 * @typedef {import('@volar/language-service').TextEdit} TextEdit
 * @typedef {import('mdast').Nodes} Nodes
 */

/**
 * @typedef SyntaxToggleParams
 *   The request parameters for LSP toggle requests.
 * @property {string} uri
 *   The URI of the document the request is for.
 * @property {Range} range
 *   The range that is selected by the user.
 */

/**
 * @callback SyntaxToggle
 *   A function to toggle prose markdown syntax based on the AST.
 * @param {SyntaxToggleParams} params
 *   The input parameters from the LSP request.
 * @returns {TextEdit[] | undefined}
 *   LSP text edits that should be made.
 */

import {visitParents} from 'unist-util-visit-parents'
import {getNodeEndOffset, getNodeStartOffset} from './mdast-utils.js'
import {VirtualMdxCode} from './virtual-code.js'

/**
 * Create a function to toggle prose syntax based on the AST.
 *
 * @param {ServiceContext} context
 *   The Volar service context.
 * @param {Nodes['type']} type
 *   The type of the mdast node to toggle.
 * @param {string} separator
 *   The mdast node separator to insert.
 * @returns {SyntaxToggle}
 *   An LSP based syntax toggle function.
 */
export function createSyntaxToggle(context, type, separator) {
  return ({range, uri}) => {
    const sourceFile = context.language.files.get(uri)
    const file = sourceFile?.generated?.code

    if (!(file instanceof VirtualMdxCode)) {
      return
    }

    const ast = file.ast

    if (!ast) {
      return
    }

    const doc = context.documents.get(uri, file.languageId, file.snapshot)
    const selectionStart = doc.offsetAt(range.start)
    const selectionEnd = doc.offsetAt(range.end)

    /** @type {TextEdit[]} */
    const edits = []

    visitParents(ast, 'text', (node, ancestors) => {
      const nodeStart = getNodeStartOffset(node)
      const nodeEnd = getNodeEndOffset(node)

      if (selectionStart < nodeStart) {
        // Outside of this node
        return
      }

      if (selectionEnd > nodeEnd) {
        // Outside of this node
        return
      }

      const matchingAncestor = ancestors.find(
        (ancestor) => ancestor.type === type
      )

      if (matchingAncestor) {
        const ancestorStart = getNodeStartOffset(matchingAncestor)
        const ancestorEnd = getNodeEndOffset(matchingAncestor)
        const firstChildStart = getNodeStartOffset(matchingAncestor.children[0])
        const lastChildEnd = getNodeEndOffset(
          /** @type {Nodes} */ (matchingAncestor.children.at(-1))
        )

        edits.push(
          {
            newText: '',
            range: {
              start: doc.positionAt(ancestorStart),
              end: doc.positionAt(firstChildStart)
            }
          },
          {
            newText: '',
            range: {
              start: doc.positionAt(lastChildEnd),
              end: doc.positionAt(ancestorEnd)
            }
          }
        )
      } else {
        const valueOffset = getNodeStartOffset(node)
        let insertStart = valueOffset
        let insertEnd = getNodeEndOffset(node)

        for (const match of node.value.matchAll(/\b/g)) {
          if (match.index === undefined) {
            continue
          }

          const matchOffset = valueOffset + match.index

          if (matchOffset <= selectionStart) {
            insertStart = matchOffset
            continue
          }

          if (matchOffset >= selectionEnd) {
            insertEnd = matchOffset
            break
          }
        }

        const startPosition = doc.positionAt(insertStart)
        const endPosition = doc.positionAt(insertEnd)
        edits.push(
          {
            newText: separator,
            range: {start: startPosition, end: startPosition}
          },
          {
            newText: separator,
            range: {start: endPosition, end: endPosition}
          }
        )
      }
    })

    if (edits) {
      return edits
    }
  }
}
