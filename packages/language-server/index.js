#!/usr/bin/env node
import assert from 'node:assert'
import process from 'node:process'
import {
  createMdxLanguagePlugin,
  createMdxServicePlugin
} from '@mdx-js/language-service'
import {
  createConnection,
  createNodeServer,
  createTypeScriptProjectProvider
} from '@volar/language-server/node.js'
import {create as createMarkdownServicePlugin} from 'volar-service-markdown'
import {create as createTypeScriptServicePlugin} from 'volar-service-typescript'
import {loadPlugins} from './lib/configuration.js'

process.title = 'mdx-language-server'

const connection = createConnection()
const server = createNodeServer(connection)

connection.onInitialize((parameters) =>
  server.initialize(parameters, createTypeScriptProjectProvider, {
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

    getServerCapabilitiesSetup() {
      assert(server.modules.typescript, 'TypeScript module is missing')

      return {
        servicePlugins: [
          createMarkdownServicePlugin({configurationSection: 'mdx.validate'}),
          createMdxServicePlugin(),
          createTypeScriptServicePlugin(server.modules.typescript)
        ]
      }
    },

    async getProjectSetup(serviceEnvironment, projectContext) {
      assert(server.modules.typescript, 'TypeScript module is missing')

      const plugins = await loadPlugins(
        projectContext?.typescript?.configFileName,
        server.modules.typescript
      )

      return {
        languagePlugins: [createMdxLanguagePlugin(plugins)],
        servicePlugins: [
          createMarkdownServicePlugin({configurationSection: 'mdx.validate'}),
          createMdxServicePlugin(),
          createTypeScriptServicePlugin(server.modules.typescript)
        ]
      }
    }
  })
)

connection.onInitialized(() => {
  server.initialized()
})

connection.listen()
