/**
 * @fileoverview Language plugin loading utilities.
 * Handles loading and validating Volar language plugins from module specifiers.
 */

import {isValidLanguagePlugin} from './validator.js'

/**
 * @typedef {object} PluginLoadResult
 * @property {import('@volar/language-core').LanguagePlugin<unknown> | null} plugin The loaded plugin, or null if failed.
 * @property {string | null} error Error message if loading failed, or null if successful.
 */

/**
 * Load a language plugin from a module specifier.
 *
 * @param {string} moduleSpecifier
 *   The module specifier to load (e.g., './plugins/vue.cjs').
 * @param {(name: string) => unknown} resolvePlugin
 *   A function which takes a module name and resolves it to a module.
 * @returns {PluginLoadResult}
 *   An object containing the loaded plugin or an error message.
 */
export function loadLanguagePlugin(moduleSpecifier, resolvePlugin) {
  try {
    const module = resolvePlugin(moduleSpecifier)

    // Check if module exports getLanguagePlugin function
    if (
      typeof module !== 'object' ||
      module === null ||
      typeof (
        /** @type {Record<string, unknown>} */ (module).getLanguagePlugin
      ) !== 'function'
    ) {
      return {
        plugin: null,
        error: `Plugin "${moduleSpecifier}" does not export a getLanguagePlugin function`
      }
    }

    // Call getLanguagePlugin to get the plugin instance
    const plugin = /** @type {{getLanguagePlugin: () => unknown}} */ (
      module
    ).getLanguagePlugin()

    // Skip validation for our own plugins - we trust them
    if (moduleSpecifier.startsWith('./plugins/')) {
      return {
        plugin:
          /** @type {import('@volar/language-core').LanguagePlugin<unknown>} */ (
            plugin
          ),
        error: null
      }
    }

    // Validate the plugin conforms to LanguagePlugin interface
    if (!isValidLanguagePlugin(plugin)) {
      return {
        plugin: null,
        error: `Plugin "${moduleSpecifier}" getLanguagePlugin() did not return a valid LanguagePlugin (must have getLanguageId function)`
      }
    }

    return {plugin, error: null}
  } catch (error) {
    return {
      plugin: null,
      error: `Failed to import plugin "${moduleSpecifier}": ${error instanceof Error ? error.message : String(error)}`
    }
  }
}
