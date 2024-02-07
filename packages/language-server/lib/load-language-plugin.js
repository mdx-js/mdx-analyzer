/**
 * @typedef {import('@mdx-js/language-service').Commands} Commands
 * @typedef {import('unified').PluggableList} PluggableList
 * @typedef {import('unified').Plugin} Plugin
 */

import {
  createMdxLanguagePlugin,
  resolveRemarkPlugins
} from '@mdx-js/language-service'
import {loadPlugin} from 'load-plugin'
import remarkFrontmatter from 'remark-frontmatter'
import remarkGfm from 'remark-gfm'

/** @type {PluggableList} */
const defaultPlugins = [[remarkFrontmatter, ['toml', 'yaml']], remarkGfm]

/**
 * @param {import('typescript')} ts
 * @param {string | undefined} configFileName
 */
export async function loadMdxLanguagePlugin(ts, configFileName) {
  /** @type {PluggableList | undefined} */
  let plugins
  let checkMdx = false
  let jsxImportSource = 'react'

  if (configFileName) {
    const cwd = configFileName.slice(
      0,
      Math.max(0, configFileName.lastIndexOf('/'))
    )
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
    checkMdx = Boolean(commandLine.raw?.mdx?.checkMdx)
    jsxImportSource = commandLine.options.jsxImportSource || jsxImportSource
  }

  return createMdxLanguagePlugin(
    plugins || defaultPlugins,
    checkMdx,
    jsxImportSource
  )
}
