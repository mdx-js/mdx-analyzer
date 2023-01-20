/**
 * @typedef {import('unified').Pluggable} Pluggable
 * @typedef {import('unified').PluggableList} PluggableList
 */

import {loadPlugin} from 'load-plugin'

/**
 * Load remark plugins from a configuration object.
 *
 * @param {string} cwd
 *   The current working directory to resolve plugins from.
 * @param {unknown} config
 *   The object that defines the configuration.
 * @returns {Promise<PluggableList | undefined>}
 *   A list of unified plugins to use.
 */
export async function loadPlugins(cwd, config) {
  if (typeof config !== 'object') {
    return
  }

  if (!config) {
    return
  }

  if (!('plugins' in config)) {
    return
  }

  let pluginConfig = config.plugins

  if (typeof pluginConfig !== 'object') {
    return
  }

  if (!pluginConfig) {
    return
  }

  const pluginArray = Array.isArray(pluginConfig)
    ? pluginConfig
    : Object.entries(pluginConfig)

  /** @type {Promise<Pluggable>[]} */
  const plugins = []
  for (const maybeTuple of pluginArray) {
    const [name, ...options] = /** @type {unknown[]} */ ([]).concat(maybeTuple)

    if (typeof name !== 'string') {
      continue
    }

    plugins.push(
      loadPlugin(name, {prefix: 'remark', cwd}).then(
        (plugin) => /** @type {Pluggable} */ ([plugin, ...options])
      )
    )
  }
  return Promise.all(plugins)
}
