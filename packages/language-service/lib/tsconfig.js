/**
 * @import {Pluggable, PluggableList, Plugin} from 'unified'
 */

/**
 * Resolve remark plugins from TypeScript’s parsed command line options.
 *
 * @param {unknown} mdxConfig
 *   The parsed command line options from which to resolve plugins.
 * @param {(name: string) => Plugin} resolvePlugin
 *   A function which takes a plugin name, and resolvs it to a remark plugin.
 * @returns {PluggableList | undefined}
 *   An array of resolved plugins, or `undefined` in case of an invalid
 *   configuration.
 */
export function resolveRemarkPlugins(mdxConfig, resolvePlugin) {
  if (
    typeof mdxConfig !== 'object' ||
    !mdxConfig ||
    !('plugins' in mdxConfig)
  ) {
    return
  }

  const pluginConfig = mdxConfig.plugins

  if (typeof pluginConfig !== 'object' || !pluginConfig) {
    return
  }

  const pluginArray = Array.isArray(pluginConfig)
    ? pluginConfig
    : Object.entries(pluginConfig)

  if (pluginArray.length === 0) {
    return
  }

  /** @type {Pluggable[]} */
  const plugins = []
  for (const maybeTuple of pluginArray) {
    const [name, ...options] = Array.isArray(maybeTuple)
      ? maybeTuple
      : [maybeTuple]

    if (typeof name !== 'string') {
      continue
    }

    plugins.push([resolvePlugin(name), ...options])
  }

  return plugins
}
