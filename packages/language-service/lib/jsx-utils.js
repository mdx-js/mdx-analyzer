/**
 * @import {JSXIdentifier, Node} from 'estree-jsx'
 * @import {Scope} from 'estree-util-scope'
 */

/**
 * @param {string | null} name
 * @returns {name is Capitalize<string>}
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
 *  The variable names available in the scope.
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
 * @param {Map<Node, Scope | undefined>} scopes
 * @param {Map<Node, Node | null>} parents
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
