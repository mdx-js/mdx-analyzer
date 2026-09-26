#!/usr/bin/env node

/**
 * @import {VirtualCodePlugin} from '@mdx-js/language-service'
 * @import {PluggableList} from 'unified'
 */

import assert from 'node:assert'
import {createRequire} from 'node:module'
import path from 'node:path'
import process from 'node:process'
import {
  createMdxLanguagePlugin,
  createMdxServicePlugin,
  resolvePlugins
} from '@mdx-js/language-service'
import {
  createConnection,
  createServer,
  createTypeScriptProject,
  loadTsdkByPath
} from '@volar/language-server/node.js'
import remarkFrontmatter from 'remark-frontmatter'
import remarkGfm from 'remark-gfm'
import {create as createMarkdownServicePlugin} from 'volar-service-markdown'
import {create as createTypeScriptSyntacticServicePlugin} from 'volar-service-typescript/lib/plugins/syntactic.js'

process.title = 'mdx-language-server'

/** @type {PluggableList} */
const defaultPlugins = [[remarkFrontmatter, ['toml', 'yaml']], remarkGfm]
const connection = createConnection()
const server = createServer(connection)

connection.onInitialize(async (parameters) => {
  const tsdk = parameters.initializationOptions?.typescript?.tsdk
  assert.ok(
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
      ({configFileName}) => ({
        languagePlugins: getLanguagePlugins(configFileName)
      })
    ),
    [
      createMarkdownServicePlugin({
        getDiagnosticOptions(document, context) {
          return context.env.getConfiguration?.('mdx.validate')
        }
      }),
      createMdxServicePlugin(connection.workspace),
      createTypeScriptSyntacticServicePlugin(typescript)
    ]
  )

  /**
   * @param {string | undefined} tsconfig
   */
  function getLanguagePlugins(tsconfig) {
    /** @type {PluggableList | undefined} */
    let remarkPlugins
    /** @type {VirtualCodePlugin[] | undefined} */
    let virtualCodePlugins
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

      const require = createRequire(tsconfig)

      ;[remarkPlugins, virtualCodePlugins] = resolvePlugins(
        commandLine.raw?.mdx,
        (name) => require(name).default
      )
      checkMdx = Boolean(commandLine.raw?.mdx?.checkMdx)
      jsxImportSource = commandLine.options.jsxImportSource || jsxImportSource
    }

    return [
      createMdxLanguagePlugin(
        remarkPlugins || defaultPlugins,
        virtualCodePlugins,
        checkMdx,
        jsxImportSource
      )
    ]
  }
})

connection.onInitialized(() => {
  const extensions = ['mdx']

  server.initialized()
  server.fileWatcher.watchFiles([`**/*.{${extensions.join(',')}}`])
})

connection.listen()
