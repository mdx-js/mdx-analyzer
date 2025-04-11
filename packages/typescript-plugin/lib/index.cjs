'use strict'

/**
 * @import {TsConfigSourceFile} from 'typescript'
 */

const {
  createMdxLanguagePlugin,
  resolvePlugins
} = require('@mdx-js/language-service')
const {
  createLanguageServicePlugin
} = require('@volar/typescript/lib/quickstart/createLanguageServicePlugin.js')
const {createJiti} = require('jiti')
const {default: remarkFrontmatter} = require('remark-frontmatter')
const {default: remarkGfm} = require('remark-gfm')

const plugin = createLanguageServicePlugin((ts, info) => {
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

  const jiti = createJiti(configFile.fileName)

  const [remarkPlugins, virtualCodePlugins] = resolvePlugins(
    commandLine.raw?.mdx,
    (name) => jiti(name).default
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
