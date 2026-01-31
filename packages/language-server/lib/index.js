#!/usr/bin/env node

/**
 * @import {LanguageService} from '@volar/language-service'
 * @import {PluggableList} from 'unified'
 * @import {URI} from 'vscode-uri'
 */

import {createRequire} from 'node:module'
import path from 'node:path'
import process from 'node:process'
import {
  createMdxLanguagePlugin,
  createMdxServicePlugin,
  resolvePlugins
} from '@mdx-js/language-service'
import {createLanguage} from '@volar/language-core'
import {createConnection, createServer} from '@volar/language-server/node.js'
import {createLanguageServiceEnvironment} from '@volar/language-server/lib/project/simpleProject.js'
import {createLanguageService, createUriMap} from '@volar/language-service'
import remarkFrontmatter from 'remark-frontmatter'
import remarkGfm from 'remark-gfm'
import typescript from 'typescript'
import {create as createMarkdownServicePlugin} from 'volar-service-markdown'
import {create as createTypeScriptSyntacticServicePlugin} from 'volar-service-typescript/lib/plugins/syntactic.js'

process.title = 'mdx-language-server'

/** @type {PluggableList} */
const defaultPlugins = [[remarkFrontmatter, ['toml', 'yaml']], remarkGfm]
const connection = createConnection()
const server = createServer(connection)

/** @type {Map<number, (res: unknown) => void>} */
const tsserverRequestHandlers = new Map()
let tsserverRequestId = 0
let tsserverBridgeAvailable = false

// Listen for tsserver responses
connection.onNotification(
  'tsserver/response',
  /**
   * @param {[number, unknown]} params
   */
  ([id, res]) => {
    tsserverBridgeAvailable = true
    const handler = tsserverRequestHandlers.get(id)
    if (handler) {
      handler(res)
      tsserverRequestHandlers.delete(id)
    }
  }
)

/**
 * Send a request to tsserver via the client
 *
 * @template T
 * @param {string} command
 * @param {unknown} args
 * @returns {Promise<T | null>}
 */
async function sendTsServerRequest(command, args) {
  return new Promise((resolve) => {
    const requestId = ++tsserverRequestId
    tsserverRequestHandlers.set(
      requestId,
      /** @type {(res: unknown) => void} */ (resolve)
    )
    connection.sendNotification('tsserver/request', [requestId, command, args])

    // Short timeout - if tsserver bridge is not available, fall back quickly
    setTimeout(
      () => {
        if (tsserverRequestHandlers.has(requestId)) {
          tsserverRequestHandlers.delete(requestId)
          resolve(null)
        }
      },
      tsserverBridgeAvailable ? 5000 : 100
    )
  })
}

/**
 * Find tsconfig.json for a file by walking up the directory tree
 *
 * @param {string} fileName
 * @returns {string | undefined}
 */
function findTsConfig(fileName) {
  return typescript.findConfigFile(
    path.dirname(fileName),
    typescript.sys.fileExists,
    'tsconfig.json'
  )
}

/** @type {Map<string, LanguageService>} */
const tsconfigProjects = new Map()

/** @type {Map<string, Promise<string | null>>} */
const file2ConfigPath = new Map()

/** @type {LanguageService | undefined} */
let simpleLanguageService

connection.onInitialize(async (parameters) => {
  const languageServicePlugins = [
    createMarkdownServicePlugin({
      getDiagnosticOptions(document, context) {
        return context.env.getConfiguration?.('mdx.validate')
      }
    }),
    createMdxServicePlugin(connection.workspace),
    createTypeScriptSyntacticServicePlugin(typescript)
  ]

  /**
   * Create a language service for a specific tsconfig
   *
   * @param {string | undefined} tsconfig
   * @returns {LanguageService}
   */
  function createProjectLanguageService(tsconfig) {
    let languagePlugin

    if (tsconfig && !typescript.server.isInferredProjectName(tsconfig)) {
      try {
        const configFile = typescript.readConfigFile(
          tsconfig,
          typescript.sys.readFile
        )
        const cwd = path.dirname(tsconfig)
        const commandLine = typescript.parseJsonConfigFileContent(
          configFile.config,
          typescript.sys,
          cwd,
          undefined,
          tsconfig
        )

        const mdxConfig = commandLine.raw?.mdx
        if (mdxConfig) {
          const require = createRequire(tsconfig)
          const [remarkPlugins, virtualCodePlugins] = resolvePlugins(
            mdxConfig,
            (name) => require(name).default
          )

          languagePlugin = createMdxLanguagePlugin(
            remarkPlugins || defaultPlugins,
            virtualCodePlugins,
            Boolean(mdxConfig.checkMdx),
            commandLine.options.jsxImportSource
          )
        }
      } catch {
        // Fall through to default
      }
    }

    languagePlugin ||= createMdxLanguagePlugin(defaultPlugins)

    /** @type {Map<URI, import('@volar/language-core').SourceScript<URI>>} */
    const scriptRegistry = createUriMap(false)

    const language = createLanguage(
      [
        {
          getLanguageId: (/** @type {URI} */ uri) =>
            server.documents.get(uri)?.languageId
        },
        languagePlugin
      ],
      scriptRegistry,
      (/** @type {URI} */ uri) => {
        const document = server.documents.get(uri)
        if (document) {
          language.scripts.set(uri, document.getSnapshot(), document.languageId)
        } else {
          language.scripts.delete(uri)
        }
      }
    )

    return createLanguageService(
      language,
      languageServicePlugins,
      createLanguageServiceEnvironment(server, [
        ...server.workspaceFolders.all
      ]),
      {}
    )
  }

  return server.initialize(
    parameters,
    {
      setup() {},
      async getLanguageService(uri) {
        if (uri.scheme === 'file') {
          const fileName = uri.fsPath.replaceAll('\\', '/')
          let configPathPromise = file2ConfigPath.get(fileName)

          if (!configPathPromise) {
            configPathPromise = (async () => {
              // First try to get config from tsserver (for accurate project info)
              /** @type {{configFileName?: string} | null} */
              const projectInfo = await sendTsServerRequest(
                '_mdx:projectInfo',
                {
                  file: fileName,
                  needFileNameList: false
                }
              )

              if (projectInfo?.configFileName) {
                return projectInfo.configFileName
              }

              // Fall back to finding tsconfig manually
              return findTsConfig(fileName) || null
            })()
            file2ConfigPath.set(fileName, configPathPromise)
          }

          const configFilePath = await configPathPromise
          if (configFilePath) {
            let languageService = tsconfigProjects.get(configFilePath)
            if (!languageService) {
              languageService = createProjectLanguageService(configFilePath)
              tsconfigProjects.set(configFilePath, languageService)
            }

            return languageService
          }
        }

        simpleLanguageService ||= createProjectLanguageService(undefined)
        return simpleLanguageService
      },
      getExistingLanguageServices() {
        const services = [...tsconfigProjects.values()]
        if (simpleLanguageService) {
          services.push(simpleLanguageService)
        }

        return services
      },
      reload() {
        for (const service of tsconfigProjects.values()) {
          service.dispose()
        }

        tsconfigProjects.clear()
        file2ConfigPath.clear()
        if (simpleLanguageService) {
          simpleLanguageService.dispose()
          simpleLanguageService = undefined
        }
      }
    },
    languageServicePlugins
  )
})

connection.onInitialized(() => {
  server.initialized()

  // Clear caches when tsconfig changes
  server.fileWatcher?.onDidChangeWatchedFiles(({changes}) => {
    for (const change of changes) {
      if (change.uri.endsWith('tsconfig.json')) {
        for (const service of tsconfigProjects.values()) {
          service.dispose()
        }

        tsconfigProjects.clear()
        file2ConfigPath.clear()
        break
      }
    }
  })
})

connection.listen()
