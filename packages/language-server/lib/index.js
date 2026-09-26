#!/usr/bin/env node

/**
 * @import {PluggableList} from 'unified'
 */

import process from 'node:process'
import {
  createMdxLanguagePlugin,
  createMdxServicePlugin
} from '@mdx-js/language-service'
import {
  createConnection,
  createServer,
  createSimpleProject
} from '@volar/language-server/node.js'
import remarkFrontmatter from 'remark-frontmatter'
import remarkGfm from 'remark-gfm'
import {create as createMarkdownServicePlugin} from 'volar-service-markdown'

process.title = 'mdx-language-server'

/** @type {PluggableList} */
const defaultPlugins = [[remarkFrontmatter, ['toml', 'yaml']], remarkGfm]
const connection = createConnection()
const server = createServer(connection)

connection.onInitialize(async (parameters) => {
  return server.initialize(
    parameters,
    createSimpleProject([
      createMdxLanguagePlugin(defaultPlugins, [], false, 'react')
    ]),
    [
      createMarkdownServicePlugin({
        getDiagnosticOptions(document, context) {
          return context.env.getConfiguration?.('mdx.validate')
        }
      }),
      createMdxServicePlugin(connection.workspace)
    ]
  )
})

connection.onInitialized(() => {
  const extensions = ['mdx']

  server.initialized()
  server.fileWatcher.watchFiles([`**/*.{${extensions.join(',')}}`])
})

connection.listen()
