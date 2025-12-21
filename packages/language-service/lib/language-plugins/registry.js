/**
 * @fileoverview Framework registry for language plugin resolution.
 * Maps framework shorthands to their plugin specifiers and peer dependencies.
 */

/**
 * @typedef {object} FrameworkConfig
 * @property {string} plugin The plugin module specifier.
 * @property {string[]} peerDependencies Required peer dependencies.
 */

/**
 * Map of framework shorthands to their plugin specifiers and required peer dependencies.
 * @type {Record<string, FrameworkConfig>}
 */
export const FRAMEWORK_PLUGINS = {
  vue: {
    plugin: './plugins/vue.cjs',
    peerDependencies: ['@vue/language-core']
  },
  svelte: {
    plugin: './plugins/svelte.cjs',
    peerDependencies: ['svelte2tsx']
  },
  astro: {
    plugin: './plugins/astro.cjs',
    peerDependencies: ['@astrojs/ts-plugin']
  }
}

/**
 * Check if a string is a known framework shorthand.
 *
 * @param {string} name
 *   The name to check.
 * @returns {name is keyof typeof FRAMEWORK_PLUGINS}
 *   Whether the name is a known framework shorthand.
 */
export function isFrameworkShorthand(name) {
  return name.toLowerCase() in FRAMEWORK_PLUGINS
}

/**
 * Get framework configuration by shorthand name.
 *
 * @param {string} name
 *   The framework shorthand (case-insensitive).
 * @returns {FrameworkConfig | undefined}
 *   The framework configuration, or undefined if not found.
 */
export function getFrameworkConfig(name) {
  return FRAMEWORK_PLUGINS[name.toLowerCase()]
}

/**
 * Get list of all supported framework names.
 *
 * @returns {string[]}
 *   Array of framework shorthand names.
 */
export function getSupportedFrameworks() {
  return Object.keys(FRAMEWORK_PLUGINS)
}
