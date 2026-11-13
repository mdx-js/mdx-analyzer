/**
 * @import {JSXIdentifier, Node} from 'estree-jsx'
 * @import {Scope} from 'estree-util-scope'
 */

/**
 * @param {string | null} name
 *   The name of the JSX tag to check.
 * @returns {name is Capitalize<string>}
 *   Whether or not the name is capitalized.
 */
function isJsxReference(name) {
  if (!name) {
    return false
  }

  const char = name.charAt(0)
  return char === char.toUpperCase()
}

/**
 * Check if a name belongs to a JSX component that can be injected.
 *
 * These are components whose name start with an upper case character. They may
 * also not be defined in the scope.
 *
 * @param {string | null} name
 *   The name of the component to check.
 * @param {Scope} scope
 *   The variable names available in the scope.
 * @returns {boolean}
 *   Whether or not the given name is that of an injectable JSX component.
 */
export function isInjectableComponent(name, scope) {
  if (!isJsxReference(name)) {
    return false
  }

  return !scope.defined.includes(name)
}

/**
 * @param {JSXIdentifier} node
 *   The node to check.
 * @param {Map<Node, Scope | undefined>} scopes
 *   The ESTree scopes the node is in.
 * @param {Map<Node, Node | null>} parents
 *   A map that maps all program nodes to their parents.
 * @returns {boolean}
 *   Whether or not the node name is injectable into using MDX components.
 */
export function isInjectableEstree(node, scopes, parents) {
  if (!isJsxReference(node.name)) {
    return false
  }

  /** @type {Node | null | undefined} */
  let current = node
  while (current) {
    const scope = scopes.get(current)
    if (scope?.defined.includes(node.name)) {
      return false
    }

    current = parents.get(current)
  }

  return true
}
