/**
 * Check if a name belongs to a JSX component that can be injected.
 *
 * These are components whose name start with an upper case character. They may
 * also not be defined in the scope.
 *
 * @param {string | null} name
 *   The name of the component to check.
 * @param {string[]} scope
 *  The variable names available in the scope.
 * @returns {boolean}
 *   Whether or not the given name is that of an injectable JSX component.
 */
export function isInjectableComponent(name, scope) {
  if (!name) {
    return false
  }

  const char = name.charAt(0)
  if (char !== char.toUpperCase()) {
    return false
  }

  return !scope.includes(name)
}
