/**
 * @typedef {import('mdast').Definition} Definition
 * @typedef {import('mdast').LinkReference} LinkReference
 * @typedef {import('mdast').Root} Root
 * @typedef {import('unist').Position} Position
 */

import {visit} from 'unist-util-visit'

/**
 * Get the definition link of a markdown AST at a given position.
 *
 * @param {Root} ast
 *   The markdown AST.
 * @param {number} position
 *   The position to get the definition for.
 * @returns {Definition | undefined}
 *   The position at which the definition can be found.
 */
export function getMarkdownDefinitionAtPosition(ast, position) {
  /** @type {LinkReference | undefined} */
  let reference
  /** @type {Map<string, Definition>} */
  const definitions = new Map()

  visit(ast, (node) => {
    const start = node.position?.start.offset
    const end = node.position?.end.offset

    if (start === undefined || end === undefined) {
      return
    }

    if (node.type === 'linkReference') {
      if (position >= start && position <= end) {
        reference = node
      }
    } else if (
      node.type === 'definition' &&
      !definitions.has(node.identifier)
    ) {
      definitions.set(node.identifier, node)
    }
  })

  if (!reference) {
    return
  }

  return definitions.get(reference.identifier)
}
