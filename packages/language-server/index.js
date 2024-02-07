#!/usr/bin/env node

/**
 * @typedef {import('@mdx-js/language-service').Commands} Commands
 * @typedef {import('unified').PluggableList} PluggableList
 * @typedef {import('unified').Plugin} Plugin
 */

import assert from 'node:assert'
import process from 'node:process'
import {createMdxServicePlugin} from '@mdx-js/language-service'
import {
  createConnection,
  createServer,
  createSimpleProjectProvider
} from '@volar/language-server/node.js'
import {create as createMarkdownServicePlugin} from 'volar-service-markdown'
import {create as createTypeScriptServicePlugin} from 'volar-service-typescript'
import {loadMdxLanguagePlugin} from './lib/load-language-plugin.js'

process.title = 'mdx-language-server'

const connection = createConnection()
const server = createServer(connection)

connection.onInitialize((parameters) =>
  server.initialize(parameters, createSimpleProjectProvider, {
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

    getServicePlugins() {
      assert(server.modules.typescript, 'TypeScript module is missing')

      return [
        createMarkdownServicePlugin({configurationSection: 'mdx.validate'}),
        createMdxServicePlugin(),
        createTypeScriptServicePlugin(server.modules.typescript)
      ]
    },

    async getLanguagePlugins(serviceEnvironment, projectContext) {
      const ts = server.modules.typescript
      assert(ts, 'TypeScript module is missing')

      const configFileName = projectContext?.typescript?.configFileName

      return [await loadMdxLanguagePlugin(ts, configFileName)]
    }
  })
)

connection.onRequest('mdx/toggleDelete', async (parameters) => {
  const commands = await getCommands(parameters.uri)
  return commands.toggleDelete(parameters)
})

connection.onRequest('mdx/toggleEmphasis', async (parameters) => {
  const commands = await getCommands(parameters.uri)
  return commands.toggleEmphasis(parameters)
})

connection.onRequest('mdx/toggleInlineCode', async (parameters) => {
  const commands = await getCommands(parameters.uri)
  return commands.toggleInlineCode(parameters)
})

connection.onRequest('mdx/toggleStrong', async (parameters) => {
  const commands = await getCommands(parameters.uri)
  return commands.toggleStrong(parameters)
})

connection.onInitialized(() => {
  server.initialized()
})

connection.listen()

/**
 * @param {string} uri
 * @returns {Promise<Commands>}
 */
async function getCommands(uri) {
  const project = await server.projects.getProject(uri)
  const service = project.getLanguageService()
  return service.context.inject('mdxCommands')
}
