'use strict'

/**
 * @import {TsConfigSourceFile} from 'typescript'
 */

const {createRequire} = require('node:module')
const {
  createMdxLanguagePlugin,
  resolvePlugins
} = require('@mdx-js/language-service')
const {
  createLanguageServicePlugin
} = require('@volar/typescript/lib/quickstart/createLanguageServicePlugin.js')
const {default: remarkFrontmatter} = require('remark-frontmatter')
const {default: remarkGfm} = require('remark-gfm')

const plugin = createLanguageServicePlugin((ts, info) => {
  const {getAllProjectErrors} = info.project

  // Filter out the message "No inputs were found in config file …" if the
  // project contains MDX files.
  info.project.getAllProjectErrors = () => {
    const diagnostics = getAllProjectErrors.call(info.project)
    const fileNames = info.project.getFileNames(true, true)

    const hasMdx = fileNames.some((fileName) => fileName.endsWith('.mdx'))

    if (hasMdx) {
      diagnostics.filter((diagnostic) => diagnostic.code !== 18_003)
    }

    return diagnostics
  }

  // Add MDX custom commands for language server communication
  addMdxCommands(ts, info)

  if (info.project.projectKind !== ts.server.ProjectKind.Configured) {
    return {
      languagePlugins: [
        createMdxLanguagePlugin([
          [remarkFrontmatter, ['toml', 'yaml']],
          remarkGfm
        ])
      ]
    }
  }

  const cwd = info.project.getCurrentDirectory()
  // eslint-disable-next-line prefer-destructuring
  const configFile = /** @type {TsConfigSourceFile} */ (
    info.project.getCompilerOptions().configFile
  )

  const commandLine = ts.parseJsonSourceFileConfigFileContent(
    configFile,
    ts.sys,
    cwd,
    undefined,
    configFile.fileName
  )

  const require = createRequire(configFile.fileName)

  const [remarkPlugins, virtualCodePlugins] = resolvePlugins(
    commandLine.raw?.mdx,
    (name) => require(name).default
  )

  return {
    languagePlugins: [
      createMdxLanguagePlugin(
        remarkPlugins || [[remarkFrontmatter, ['toml', 'yaml']], remarkGfm],
        virtualCodePlugins,
        Boolean(commandLine.raw?.mdx?.checkMdx),
        commandLine.options.jsxImportSource
      )
    ]
  }
})

/**
 * Add MDX custom commands for language server communication
 * @param {typeof import('typescript')} ts
 * @param {import('typescript').server.PluginCreateInfo} info
 */
function addMdxCommands(ts, info) {
  const {projectService} = info.project
  projectService.logger.info(
    'MDX: called handler processing ' + info.project.projectKind
  )

  if (!info.session) {
    projectService.logger.info('MDX: there is no session in info.')
    return
  }

  const {session} = info

  if (!(/** @type {Function | undefined} */ (session.addProtocolHandler))) {
    projectService.logger.info('MDX: there is no addProtocolHandler method.')
    return
  }

  /** @type {Map<string, (request: import('typescript').server.protocol.Request) => import('typescript').server.HandlerResponse> | undefined} */
  // @ts-ignore - handlers is a private property
  const {handlers} = session

  if (!handlers || handlers.has('_mdx:projectInfo')) {
    return
  }

  const projectInfoHandler = handlers.get('projectInfo')
  if (!projectInfoHandler) {
    return
  }

  // Forward projectInfo request to get tsconfig path for a file
  session.addProtocolHandler('_mdx:projectInfo', (request) =>
    projectInfoHandler(request)
  )

  projectService.logger.info('MDX: registered custom commands')
}

module.exports = plugin
