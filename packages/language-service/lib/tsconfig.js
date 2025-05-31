/**
 * @import {Pluggable, PluggableList, Plugin} from 'unified'
 * @import {VirtualCodePlugin} from './plugins/plugin.js'
 */

import {recmaExportFilepath} from './plugins/recma-export-filepath.js'
import {rehypeMdxTitle} from './plugins/rehype-mdx-title.js'
import {remarkMdxFrontmatter} from './plugins/remark-mdx-frontmatter.js'

/**
 * Resolve remark plugins from TypeScript’s parsed command line options.
 *
 * @param {unknown} mdxConfig
 *   The parsed command line options from which to resolve plugins.
 * @param {(name: string) => Plugin} resolvePlugin
 *   A function which takes a plugin name, and resolvs it to a remark plugin.
 * @returns {[PluggableList?, VirtualCodePlugin[]?]}
 *   An array of resolved plugins, or `undefined` in case of an invalid
 *   configuration.
 */
export function resolvePlugins(mdxConfig, resolvePlugin) {
  if (
    typeof mdxConfig !== 'object' ||
    !mdxConfig ||
    !('plugins' in mdxConfig)
  ) {
    return []
  }

  const pluginConfig = mdxConfig.plugins

  if (typeof pluginConfig !== 'object' || !pluginConfig) {
    return []
  }

  const pluginArray = Array.isArray(pluginConfig)
    ? pluginConfig
    : Object.entries(pluginConfig)

  if (pluginArray.length === 0) {
    return []
  }

  /** @type {Pluggable[]} */
  const remarkPlugins = []
  /** @type {VirtualCodePlugin[]} */
  const virtualCodePlugins = []

  for (const maybeTuple of pluginArray) {
    const [name, ...options] = Array.isArray(maybeTuple)
      ? maybeTuple
      : [maybeTuple]

    if (typeof name !== 'string') {
      continue
    }

    switch (name) {
      case 'recma-export-filepath': {
        virtualCodePlugins.push(recmaExportFilepath(options[0]))
        break
      }

      case 'rehype-mdx-title': {
        virtualCodePlugins.push(rehypeMdxTitle(options[0]))
        break
      }

      case 'remark-mdx-frontmatter': {
        virtualCodePlugins.push(remarkMdxFrontmatter(options[0]))
        break
      }

      default: {
        remarkPlugins.push([resolvePlugin(name), ...options])
      }
    }
  }

  return [remarkPlugins, virtualCodePlugins]
}
