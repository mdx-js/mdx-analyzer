/**
 * @fileoverview Language plugin resolution from configuration.
 * Resolves both framework shorthands and custom module specifiers.
 */

import {createRequire} from 'node:module'
import {fileURLToPath} from 'node:url'
import path from 'node:path'
import {
  getFrameworkConfig,
  getSupportedFrameworks,
  isFrameworkShorthand
} from './registry.js'
import {loadLanguagePlugin} from './loader.js'
import {getMissingPeerDependencies} from './validator.js'

const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))

/**
 * Load a built-in framework plugin from the bundled plugins.
 *
 * @param {string} frameworkName
 *   The framework name (e.g., "vue", "svelte", "astro").
 * @returns {import('@volar/language-core').LanguagePlugin<unknown> | null}
 *   The loaded plugin, or null if not found.
 */
function loadBuiltInPlugin(frameworkName) {
  try {
    const pluginPath = path.join(__dirname, 'plugins', `${frameworkName}.cjs`)
    const module = require(pluginPath)
    return module.getLanguagePlugin
      ? module.getLanguagePlugin()
      : module.default?.getLanguagePlugin?.() || null
  } catch {
    return null
  }
}

/**
 * @typedef {object} LanguagePluginLoadError
 * @property {string} name The plugin name that failed to load.
 * @property {'import' | 'invalid' | 'peer-dependency'} type The type of error.
 * @property {string} message A human-readable error message.
 */

/**
 * @typedef {object} ResolveLanguagePluginsResult
 * @property {import('@volar/language-core').LanguagePlugin<unknown>[]} plugins Successfully loaded plugins.
 * @property {LanguagePluginLoadError[]} errors Errors encountered during loading.
 */

/**
 * Resolve a framework shorthand to its plugin.
 *
 * @param {string} frameworkName
 *   The framework shorthand name (e.g., "vue", "svelte").
 * @param {(name: string) => unknown} resolvePlugin
 *   A function which takes a module name and resolves it to a module.
 * @returns {{plugin: import('@volar/language-core').LanguagePlugin<unknown> | null, error: LanguagePluginLoadError | null}}
 *   An object containing the loaded plugin or an error.
 */
function resolveFrameworkShorthand(frameworkName, resolvePlugin) {
  const frameworkConfig = getFrameworkConfig(frameworkName)

  if (!frameworkConfig) {
    const available = getSupportedFrameworks().join(', ')
    return {
      plugin: null,
      error: {
        name: frameworkName,
        type: 'invalid',
        message: `Unknown framework "${frameworkName}". Supported frameworks: ${available}`
      }
    }
  }

  // Validate peer dependencies
  const missingPeers = getMissingPeerDependencies(
    frameworkConfig.peerDependencies,
    resolvePlugin
  )

  if (missingPeers.length > 0) {
    return {
      plugin: null,
      error: {
        name: frameworkName,
        type: 'peer-dependency',
        message: `Framework "${frameworkName}" requires missing peer ${
          missingPeers.length === 1 ? 'dependency' : 'dependencies'
        }: ${missingPeers.join(', ')}. Install with: npm install ${missingPeers.join(' ')}`
      }
    }
  }

  // Load the plugin - first try as a module, then fall back to built-in
  let {plugin, error} = loadLanguagePlugin(
    frameworkConfig.plugin,
    resolvePlugin
  )

  // If module loading failed and it's a built-in framework, try loading the bundled plugin
  if (error && isFrameworkShorthand(frameworkName)) {
    const builtInPlugin = loadBuiltInPlugin(frameworkName)
    if (builtInPlugin) {
      plugin = builtInPlugin
      error = null
    }
  }

  if (error) {
    return {
      plugin: null,
      error: {
        name: frameworkName,
        type: 'import',
        message: error
      }
    }
  }

  return {plugin, error: null}
}

/**
 * Resolve a custom module specifier to its plugin.
 *
 * @param {string} moduleSpecifier
 *   The module specifier (e.g., "@my-org/my-plugin").
 * @param {(name: string) => unknown} resolvePlugin
 *   A function which takes a module name and resolves it to a module.
 * @returns {{plugin: import('@volar/language-core').LanguagePlugin<unknown> | null, error: LanguagePluginLoadError | null}}
 *   An object containing the loaded plugin or an error.
 */
function resolveModuleSpecifier(moduleSpecifier, resolvePlugin) {
  const {plugin, error} = loadLanguagePlugin(moduleSpecifier, resolvePlugin)

  if (error) {
    return {
      plugin: null,
      error: {
        name: moduleSpecifier,
        type: 'import',
        message: error
      }
    }
  }

  return {plugin, error: null}
}

/**
 * Resolve language plugins from TypeScript's parsed command line options.
 *
 * Supports both framework shorthands (e.g., "vue", "svelte", "astro") and
 * custom module specifiers (e.g., "@my-org/my-plugin").
 *
 * @param {unknown} mdxConfig
 *   The parsed command line options from which to resolve plugins.
 * @param {(name: string) => unknown} resolvePlugin
 *   A function which takes a plugin name, and resolves it to a module.
 * @returns {ResolveLanguagePluginsResult}
 *   An object containing successfully loaded plugins and any errors encountered.
 */
export function resolveLanguagePlugins(mdxConfig, resolvePlugin) {
  /** @type {import('@volar/language-core').LanguagePlugin<unknown>[]} */
  const plugins = []
  /** @type {LanguagePluginLoadError[]} */
  const errors = []

  if (
    typeof mdxConfig !== 'object' ||
    !mdxConfig ||
    !('languagePlugins' in mdxConfig)
  ) {
    return {plugins, errors}
  }

  const pluginConfig = mdxConfig.languagePlugins

  if (!Array.isArray(pluginConfig)) {
    return {plugins, errors}
  }

  for (const item of pluginConfig) {
    if (typeof item !== 'string') {
      continue
    }

    // Determine if this is a framework shorthand or custom module specifier
    const result = isFrameworkShorthand(item)
      ? resolveFrameworkShorthand(item, resolvePlugin)
      : resolveModuleSpecifier(item, resolvePlugin)

    if (result.error) {
      errors.push(result.error)
    } else if (result.plugin) {
      plugins.push(result.plugin)
    }
  }

  return {plugins, errors}
}
