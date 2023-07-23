/**
 * @typedef {import('@volar/language-server/node.js').LanguageServerPlugin} LanguageServerPlugin
 */

import assert from 'node:assert'
import {resolveConfig} from '@mdx-js/language-service'
import {loadPlugins} from './configuration.js'

/**
 * @type {LanguageServerPlugin}
 */
export function plugin(initOptions, modules) {
  return {
    extraFileExtensions: [
      {extension: 'mdx', isMixedContent: true, scriptKind: 7}
    ],

    watchFileExtensions: [
      'cjs',
      'ctx',
      'js',
      'json',
      'mdx',
      'mjs',
      'mts',
      'ts',
      'tsx'
    ],

    async resolveConfig(config, ctx) {
      assert(modules.typescript, 'TypeScript module is missing')

      const plugins = await loadPlugins(
        ctx?.project?.tsConfig,
        modules.typescript
      )

      return resolveConfig(config, modules.typescript, plugins)
    }
  }
}
