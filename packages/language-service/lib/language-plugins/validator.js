/**
 * @fileoverview Validation utilities for language plugins.
 */

/**
 * Validate that an object conforms to the Volar LanguagePlugin interface.
 *
 * @param {unknown} plugin
 *   The object to validate.
 * @returns {plugin is import('@volar/language-core').LanguagePlugin<unknown>}
 *   Whether the object is a valid LanguagePlugin.
 */
export function isValidLanguagePlugin(plugin) {
  if (typeof plugin !== 'object' || plugin === null) {
    return false
  }

  const p = /** @type {Record<string, unknown>} */ (plugin)

  // GetLanguageId is required
  if (typeof p.getLanguageId !== 'function') {
    return false
  }

  // CreateVirtualCode is optional but must be a function if present
  if (
    p.createVirtualCode !== undefined &&
    typeof p.createVirtualCode !== 'function'
  ) {
    return false
  }

  return true
}

/**
 * Check if a peer dependency is installed.
 *
 * @param {string} packageName
 *   The package name to check.
 * @param {(name: string) => unknown} resolvePlugin
 *   The module resolution function.
 * @returns {boolean}
 *   Whether the package is installed.
 */
export function isPeerDependencyInstalled(packageName, resolvePlugin) {
  try {
    resolvePlugin(packageName)
    return true
  } catch {
    return false
  }
}

/**
 * Validate that required peer dependencies are installed.
 *
 * @param {string[]} peerDependencies
 *   Array of peer dependency package names to check.
 * @param {(name: string) => unknown} resolvePlugin
 *   The module resolution function.
 * @returns {string[]}
 *   Array of missing peer dependencies.
 */
export function getMissingPeerDependencies(peerDependencies, resolvePlugin) {
  return peerDependencies.filter(
    (peer) => !isPeerDependencyInstalled(peer, resolvePlugin)
  )
}
