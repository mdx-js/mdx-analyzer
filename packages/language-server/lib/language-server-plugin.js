/**
 * @typedef {import('@volar/language-server/node.js').ServerPlugin} ServerPlugin
 */

import assert from 'node:assert'
import {getLanguageModule} from '@mdx-js/language-service'
import {create as createMarkdownService} from 'volar-service-markdown'
import {create as createTypeScriptService} from 'volar-service-typescript'
import {loadPlugins} from './configuration.js'

/**
 * @type {ServerPlugin}
 */
export function plugin({modules}) {
  return {
    typescript: {
      extraFileExtensions: [
        {extension: 'mdx', isMixedContent: true, scriptKind: 7}
      ]
    },

    watchFileExtensions: [
      'cjs',
      'cts',
      'js',
      'jsx',
      'json',
      'mdx',
      'mjs',
      'mts',
      'ts',
      'tsx'
    ],

    async resolveConfig(config, env, projectContext) {
      assert(modules.typescript, 'TypeScript module is missing')

      const plugins = await loadPlugins(
        projectContext?.typescript?.configFileName,
        modules.typescript
      )

      config.languages ||= {}
      config.languages.mdx ||= getLanguageModule(modules.typescript, plugins)

      config.services ||= {}
      config.services.markdown = createMarkdownService()
      config.services.typescript = createTypeScriptService(modules.typescript)

      return config
    }
  }
}
