/**
 * @typedef {import('typescript').TsConfigSourceFile} TsConfigSourceFile
 * @typedef {import('unified').PluggableList} PluggableList
 * @typedef {import('unified').Plugin} Plugin
 */

import {
  createMdxLanguagePlugin,
  resolveRemarkPlugins
} from '@mdx-js/language-service'
import {createAsyncLanguageServicePlugin} from '@volar/typescript/lib/quickstart/createAsyncLanguageServicePlugin.js'
import {loadPlugin} from 'load-plugin'
import remarkFrontmatter from 'remark-frontmatter'
import remarkGfm from 'remark-gfm'

/** @type {PluggableList} */
const defaultPlugins = [[remarkFrontmatter, ['toml', 'yaml']], remarkGfm]

// eslint-disable-next-line unicorn/prefer-module
module.exports = createAsyncLanguageServicePlugin(
  ['.mdx'],
  2 /* JSX */,
  async (ts, info) => {
    if (info.project.projectKind !== ts.server.ProjectKind.Configured) {
      return [createMdxLanguagePlugin(defaultPlugins)]
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

    const plugins = await resolveRemarkPlugins(
      commandLine.raw?.mdx,
      (name) =>
        /** @type {Promise<Plugin>} */ (
          loadPlugin(name, {prefix: 'remark', cwd})
        )
    )

    return [
      createMdxLanguagePlugin(
        plugins || defaultPlugins,
        Boolean(commandLine.raw?.mdx?.checkMdx),
        commandLine.options.jsxImportSource
      )
    ]
  }
)
