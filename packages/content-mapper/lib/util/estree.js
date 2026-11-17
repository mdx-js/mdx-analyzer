/**
 * @import {Node} from 'estree-jsx'
 */

/**
 * Check if an estree node is a function node.
 *
 * @param {Node} node
 *   The node to check
 * @returns {boolean}
 *   Whether or not the node is a function node.
 */
export function isFunctionNode(node) {
  return (
    node.type === 'ArrowFunctionExpression' ||
    node.type === 'FunctionDeclaration' ||
    node.type === 'FunctionExpression'
  )
}

/**
 * Check if a node uses `await`.
 *
 * @param {Node} node
 *   The node to check.
 * @returns {boolean}
 *   Whether or not the node uses `await`.
 */
function isAwaitNode(node) {
  return (
    node.type === 'AwaitExpression' ||
    (node.type === 'ForOfStatement' && node.await)
  )
}

/**
 * Check if a node should make the MDX content asynchronous.
 *
 * @param {Node} node
 *   The node to check.
 * @param {Map<Node, Node | null>} parents
 *   A map of all known parents of the node.
 * @returns {boolean}
 *   Whether or not the MDX content should me asynchronous.
 */
export function isAsyncMdx(node, parents) {
  if (!isAwaitNode(node)) {
    return false
  }

  for (
    let ancestor = /** @type {Node | null | undefined} */ (node);
    ancestor;
    ancestor = parents.get(ancestor)
  ) {
    if (isFunctionNode(ancestor)) {
      return false
    }
  }

  return true
}
