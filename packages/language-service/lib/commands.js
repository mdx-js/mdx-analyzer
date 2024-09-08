/**
 * @import {LanguageServiceContext, Range, TextEdit} from '@volar/language-service'
 * @import {Nodes} from 'mdast'
 * @import {createMdxServicePlugin} from './service-plugin.js'
 */

import {visitParents} from 'unist-util-visit-parents'
import {URI} from 'vscode-uri'
import {getNodeEndOffset, getNodeStartOffset} from './mdast-utils.js'
import {VirtualMdxCode} from './virtual-code.js'

/**
 * Toggle prose syntax based on the AST.
 *
 * @param {LanguageServiceContext} context
 *   The Volar service context.
 * @param {createMdxServicePlugin.Options} options
 *   The options to use for applying workspace edits.
 * @param {Nodes['type']} type
 *   The type of the mdast node to toggle.
 * @param {string} separator
 *   The mdast node separator to insert.
 * @param {string} uri
 *   The URI of the document the request is for.
 * @param {Range} range
 *   The range that is selected by the user.
 * @returns {Promise<undefined>}
 */
export async function toggleSyntax(
  context,
  options,
  type,
  separator,
  uri,
  range
) {
  const parsedUri = URI.parse(uri)
  const sourceScript = context.language.scripts.get(parsedUri)
  const root = sourceScript?.generated?.root

  if (!(root instanceof VirtualMdxCode)) {
    return
  }

  const ast = root.ast

  if (!ast) {
    return
  }

  const doc = context.documents.get(parsedUri, root.languageId, root.snapshot)
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

  if (edits.length > 0) {
    await options.applyEdit({changes: {[uri]: edits}})
  }
}
