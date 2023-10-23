/**
 * @typedef {import('unified').Pluggable} Pluggable
 * @typedef {import('unified').PluggableList} PluggableList
 */

import path from 'node:path'
import {loadPlugin} from 'load-plugin'
import remarkFrontmatter from 'remark-frontmatter'
import remarkGfm from 'remark-gfm'

/** @type {PluggableList} */
const defaultPlugins = [[remarkFrontmatter, ['toml', 'yaml']], remarkGfm]

/**
 * Load remark plugins from a configuration object.
 *
 * @param {unknown} tsConfig
 *   The current working directory to resolve plugins from.
 * @param {typeof import('typescript')} [ts]
 * @returns {Promise<PluggableList | undefined>}
 *   A list of unified plugins to use.
 */
export async function loadPlugins(tsConfig, ts) {
  if (typeof tsConfig !== 'string' || !ts) {
    return [[remarkFrontmatter, ['toml', 'yaml']], remarkGfm]
  }

  const jsonText = ts.sys.readFile(tsConfig)

  if (jsonText === undefined) {
    return defaultPlugins
  }

  const {config, error} = ts.parseConfigFileTextToJson(tsConfig, jsonText)
  if (error) {
    return defaultPlugins
  }

  if (!config?.mdx) {
    return defaultPlugins
  }

  const pluginConfig = config.mdx.plugins

  if (typeof pluginConfig !== 'object') {
    return
  }

  if (!pluginConfig) {
    return
  }

  const pluginArray = Array.isArray(pluginConfig)
    ? pluginConfig
    : Object.entries(pluginConfig)
  const cwd = path.dirname(tsConfig)

  /** @type {Promise<Pluggable>[]} */
  const plugins = []
  for (const maybeTuple of pluginArray) {
    const [name, ...options] = Array.isArray(maybeTuple)
      ? maybeTuple
      : [maybeTuple]

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
