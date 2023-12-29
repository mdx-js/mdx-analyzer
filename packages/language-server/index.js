#!/usr/bin/env node

/**
 * @typedef {import('unified').PluggableList} PluggableList
 * @typedef {import('unified').Plugin} Plugin
 */

import assert from 'node:assert'
import path from 'node:path'
import process from 'node:process'
import {
  createMdxLanguagePlugin,
  createMdxServicePlugin,
  resolveRemarkPlugins
} from '@mdx-js/language-service'
import {
  createConnection,
  createNodeServer,
  createTypeScriptProjectProvider
} from '@volar/language-server/node.js'
import {loadPlugin} from 'load-plugin'
import remarkFrontmatter from 'remark-frontmatter'
import remarkGfm from 'remark-gfm'
import {create as createMarkdownServicePlugin} from 'volar-service-markdown'
import {create as createTypeScriptServicePlugin} from 'volar-service-typescript'

process.title = 'mdx-language-server'

/** @type {PluggableList} */
const defaultPlugins = [[remarkFrontmatter, ['toml', 'yaml']], remarkGfm]
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

      /** @type {PluggableList | undefined} */
      let plugins
      let jsxImportSource = 'react'

      if (configFileName) {
        const cwd = path.dirname(configFileName)
        const configSourceFile = ts.readJsonConfigFile(
          configFileName,
          ts.sys.readFile
        )
        const commandLine = ts.parseJsonSourceFileConfigFileContent(
          configSourceFile,
          ts.sys,
          cwd,
          undefined,
          configFileName
        )
        plugins = await resolveRemarkPlugins(
          commandLine.raw?.mdx,
          (name) =>
            /** @type {Promise<Plugin>} */ (
              loadPlugin(name, {prefix: 'remark', cwd})
            )
        )
        jsxImportSource = commandLine.options.jsxImportSource || jsxImportSource
      }

      return [
        createMdxLanguagePlugin(plugins || defaultPlugins, jsxImportSource)
      ]
    }
  })
)

connection.onInitialized(() => {
  server.initialized()
})

connection.listen()
