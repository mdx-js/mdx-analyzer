#!/usr/bin/env node

/**
 * @import {Commands} from '@mdx-js/language-service'
 * @import {PluggableList, Plugin} from 'unified'
 */

import assert from 'node:assert'
import path from 'node:path'
import process from 'node:process'
import {pathToFileURL} from 'node:url'
import {
  createMdxLanguagePlugin,
  createMdxServicePlugin,
  resolveRemarkPlugins
} from '@mdx-js/language-service'
import {
  createConnection,
  createServer,
  createTypeScriptProject,
  loadTsdkByPath
} from '@volar/language-server/node.js'
import {loadPlugin} from 'load-plugin'
import remarkFrontmatter from 'remark-frontmatter'
import remarkGfm from 'remark-gfm'
import {create as createMarkdownServicePlugin} from 'volar-service-markdown'
import {create as createTypeScriptServicePlugin} from 'volar-service-typescript'
import {create as createTypeScriptSyntacticServicePlugin} from 'volar-service-typescript/lib/plugins/syntactic.js'
import {URI} from 'vscode-uri'

process.title = 'mdx-language-server'

/** @type {PluggableList} */
const defaultPlugins = [[remarkFrontmatter, ['toml', 'yaml']], remarkGfm]
const connection = createConnection()
const server = createServer(connection)
let tsEnabled = false

connection.onInitialize(async (parameters) => {
  const tsdk = parameters.initializationOptions?.typescript?.tsdk
  tsEnabled = Boolean(parameters.initializationOptions?.typescript?.enabled)
  assert(
    typeof tsdk === 'string',
    'Missing initialization option typescript.tsdk'
  )

  const {typescript, diagnosticMessages} = loadTsdkByPath(
    tsdk,
    parameters.locale
  )

  return server.initialize(
    parameters,
    createTypeScriptProject(
      typescript,
      diagnosticMessages,
      async ({configFileName}) => ({
        languagePlugins: await getLanguagePlugins(configFileName)
      })
    ),
    getLanguageServicePlugins(),
    {
      pullModelDiagnostics:
        parameters.initializationOptions?.pullModelDiagnostics
    }
  )

  function getLanguageServicePlugins() {
    const plugins = [
      createMarkdownServicePlugin({
        getDiagnosticOptions(document, context) {
          return context.env.getConfiguration?.('mdx.validate')
        }
      }),
      createMdxServicePlugin()
    ]

    if (tsEnabled) {
      plugins.push(...createTypeScriptServicePlugin(typescript, {}))
    } else {
      plugins.push(createTypeScriptSyntacticServicePlugin(typescript))
    }

    return plugins
  }

  /**
   * @param {string | undefined} tsconfig
   */
  async function getLanguagePlugins(tsconfig) {
    /** @type {PluggableList | undefined} */
    let plugins
    let checkMdx = false
    let jsxImportSource = 'react'

    if (tsconfig) {
      const cwd = path.dirname(tsconfig)
      const configSourceFile = typescript.readJsonConfigFile(
        tsconfig,
        typescript.sys.readFile
      )
      const commandLine = typescript.parseJsonSourceFileConfigFileContent(
        configSourceFile,
        typescript.sys,
        cwd,
        undefined,
        tsconfig
      )
      plugins = await resolveRemarkPlugins(
        commandLine.raw?.mdx,
        (name) =>
          /** @type {Promise<Plugin>} */ (
            loadPlugin(name, {prefix: 'remark', from: pathToFileURL(cwd) + '/'})
          )
      )
      checkMdx = Boolean(commandLine.raw?.mdx?.checkMdx)
      jsxImportSource = commandLine.options.jsxImportSource || jsxImportSource
    }

    return [
      createMdxLanguagePlugin(
        plugins || defaultPlugins,
        checkMdx,
        jsxImportSource
      )
    ]
  }
})

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
  const extensions = ['mdx']
  if (tsEnabled) {
    extensions.push(
      'cjs',
      'cts',
      'js',
      'jsx',
      'json',
      'mjs',
      'mts',
      'ts',
      'tsx'
    )
  }

  server.initialized()
  server.watchFiles([`**/*.{${extensions.join(',')}}`])
})

connection.listen()

/**
 * @param {string} uri
 * @returns {Promise<Commands>}
 */
async function getCommands(uri) {
  const service = await server.project.getLanguageService(URI.parse(uri))
  return service.context.inject('mdxCommands')
}
