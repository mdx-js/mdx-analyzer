#!/usr/bin/env node

/**
 * @import {LanguagePluginLoadError, VirtualCodePlugin} from '@mdx-js/language-service'
 * @import {LanguagePlugin} from '@volar/language-core'
 * @import {Diagnostic} from 'vscode-languageserver'
 * @import {PluggableList} from 'unified'
 */

import assert from 'node:assert'
import {createRequire} from 'node:module'
import path from 'node:path'
import process from 'node:process'
import {
  createMdxLanguagePlugin,
  createMdxServicePlugin,
  resolvePlugins,
  resolveLanguagePlugins
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
import {create as createTypeScriptServicePlugin} from 'volar-service-typescript'
import {create as createTypeScriptSyntacticServicePlugin} from 'volar-service-typescript/lib/plugins/syntactic.js'
import {DiagnosticSeverity} from 'vscode-languageserver'
import {URI} from 'vscode-uri'

process.title = 'mdx-language-server'

/** @type {PluggableList} */
const defaultPlugins = [[remarkFrontmatter, ['toml', 'yaml']], remarkGfm]
const connection = createConnection()
const server = createServer(connection)
let tsEnabled = false
/** @type {string[]} */
const extraExtensions = []
/** @type {Map<string, LanguagePluginLoadError[]>} */
const pluginErrorsByTsconfig = new Map()

connection.onInitialize(async (parameters) => {
  const tsdk = parameters.initializationOptions?.typescript?.tsdk
  tsEnabled = Boolean(parameters.initializationOptions?.typescript?.enabled)
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
    getLanguageServicePlugins()
  )

  function getLanguageServicePlugins() {
    const plugins = [
      createMarkdownServicePlugin({
        getDiagnosticOptions(document, context) {
          return context.env.getConfiguration?.('mdx.validate')
        }
      }),
      createMdxServicePlugin(connection.workspace)
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
  function getLanguagePlugins(tsconfig) {
    /** @type {PluggableList | undefined} */
    let remarkPlugins
    /** @type {VirtualCodePlugin[] | undefined} */
    let virtualCodePlugins
    let checkMdx = false
    let jsxImportSource = 'react'

    /** @type {LanguagePlugin<URI>[]} */
    const languagePlugins = []

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

      // Resolve external language plugins
      const {plugins: externalPlugins, errors} = resolveLanguagePlugins(
        commandLine.raw?.mdx,
        (name) => require(name)
      )

      if (externalPlugins.length > 0) {
        // External plugins are validated at runtime; cast is safe as URI extends string behavior
        languagePlugins.push(
          .../** @type {LanguagePlugin<URI>[]} */ (externalPlugins)
        )
      }

      // Store errors for diagnostics (will be published in onInitialized)
      if (errors.length > 0) {
        pluginErrorsByTsconfig.set(tsconfig, errors)

        // Also log to console for visibility
        for (const error of errors) {
          connection.console.error(`[MDX] ${error.message}`)
        }
      }
    }

    // Add MDX language plugin
    languagePlugins.push(
      createMdxLanguagePlugin(
        remarkPlugins || defaultPlugins,
        virtualCodePlugins,
        checkMdx,
        jsxImportSource
      )
    )

    // Collect extra file extensions from all plugins
    for (const plugin of languagePlugins) {
      const extraFileExtensions = /** @type {any} */ (plugin).typescript
        ?.extraFileExtensions
      if (Array.isArray(extraFileExtensions)) {
        for (const ext of extraFileExtensions) {
          if (ext.extension && !extraExtensions.includes(ext.extension)) {
            extraExtensions.push(ext.extension)
          }
        }
      }
    }

    return languagePlugins
  }
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

  // Update extensions based on loaded plugins
  for (const ext of extraExtensions) {
    if (!extensions.includes(ext)) {
      extensions.push(ext)
    }
  }

  // Publish diagnostics for any language plugin loading errors
  for (const [tsconfig, errors] of pluginErrorsByTsconfig) {
    /** @type {Diagnostic[]} */
    const diagnostics = errors.map((error) => ({
      severity: DiagnosticSeverity.Error,
      range: {
        start: {line: 0, character: 0},
        end: {line: 0, character: 0}
      },
      message: error.message,
      source: 'mdx'
    }))

    connection.sendDiagnostics({
      uri: URI.file(tsconfig).toString(),
      diagnostics
    })
  }

  server.initialized()
  server.fileWatcher.watchFiles([`**/*.{${extensions.join(',')}}`])
})

connection.listen()
