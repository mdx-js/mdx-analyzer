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

  // Filter out the message “No inputs were found in config file …” if the
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

module.exports = plugin
