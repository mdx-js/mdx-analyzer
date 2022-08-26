/**
 * @typedef {import('unified').Processor<import('mdast').Root>} Processor
 * @typedef {import('mdast').Definition} Definition
 * @typedef {import('mdast').LinkReference} LinkReference
 * @typedef {import('vscode-languageserver-types').LocationLink} LocationLink
 * @typedef {import('vscode-languageserver-types').Position} Position
 * @typedef {import('vscode-languageserver-textdocument').TextDocument} TextDocument
 */

import { fromPosition } from 'unist-util-lsp'
import { visit } from 'unist-util-visit'

/**
 * @param {TextDocument} document
 * @param {Position} position
 * @param {Processor} processor
 * @returns {LocationLink[]} A list of document links.
 */
export function provideLocationLinks(document, position, processor) {
  const text = document.getText()
  const ast = processor.parse(text)
  /** @type {LinkReference | undefined} */
  let reference
  /** @type {Map<string, Definition>} */
  const definitions = new Map()
  const positionOffset = document.offsetAt(position)

  visit(
    ast,
    ['definition', 'linkReference'],
    /**
     * @param {Definition | LinkReference} node
     */
    node => {
      const nodePos = node.position
      if (node.type === 'linkReference') {
        if (
          nodePos &&
          positionOffset >= /** @type {number} */ (nodePos.start.offset) &&
          positionOffset <= /** @type {number} */ (nodePos.end.offset)
        ) {
          reference = node
        }
      } else if (!definitions.has(node.identifier) && nodePos) {
        definitions.set(node.identifier, node)
      }
    },
  )

  if (!reference) {
    return []
  }

  const definition = definitions.get(reference.identifier)

  if (!definition?.position) {
    return []
  }

  return [
    {
      originSelectionRange: reference.position
        ? fromPosition(reference.position)
        : undefined,
      targetUri: document.uri,
      targetRange: fromPosition(definition.position),
      targetSelectionRange: fromPosition(definition.position),
    },
  ]
}
