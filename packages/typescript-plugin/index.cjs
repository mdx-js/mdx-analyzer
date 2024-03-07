'use strict'

/**
 * @typedef {import('typescript').TsConfigSourceFile} TsConfigSourceFile
 * @typedef {import('unified', {with: {'resolution-mode': 'import'}}).Plugin} Plugin
 */

const {
  createAsyncLanguageServicePlugin
} = require('@volar/typescript/lib/quickstart/createAsyncLanguageServicePlugin.js')

const plugin = createAsyncLanguageServicePlugin(
  ['.mdx'],
  2 /* JSX */,
  async (ts, info) => {
    const [
      {createMdxLanguagePlugin, resolveRemarkPlugins},
      {loadPlugin},
      {default: remarkFrontmatter},
      {default: remarkGfm}
    ] = await Promise.all([
      import('@mdx-js/language-service'),
      import('load-plugin'),
      import('remark-frontmatter'),
      import('remark-gfm')
    ])

    if (info.project.projectKind !== ts.server.ProjectKind.Configured) {
      return [
        createMdxLanguagePlugin([
          [remarkFrontmatter, ['toml', 'yaml']],
          remarkGfm
        ])
      ]
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
        plugins || [[remarkFrontmatter, ['toml', 'yaml']], remarkGfm],
        Boolean(commandLine.raw?.mdx?.checkMdx),
        commandLine.options.jsxImportSource
      )
    ]
  }
)

module.exports = plugin
