'use strict'
/**
 * @typedef {import('typescript').LanguageService} LanguageService
 * @typedef {import('typescript').TsConfigSourceFile} TsConfigSourceFile
 * @typedef {import('typescript').server.PluginModuleFactory} PluginModuleFactory
 * @typedef {import('typescript').server.Project} Project
 * @typedef {import('unified', {with: {'resolution-mode': 'import'}}).Plugin} Plugin
 */

const {
  createFileRegistry,
  resolveCommonLanguageId
} = require('@volar/language-core')
const {
  decorateLanguageService
} = require('@volar/typescript/lib/node/decorateLanguageService')
const {
  decorateLanguageServiceHost,
  searchExternalFiles
} = require('@volar/typescript/lib/node/decorateLanguageServiceHost')
const {
  arrayItemsEqual
} = require('@volar/typescript/lib/quickstart/createLanguageServicePlugin')

/** @type {WeakMap<Project, string[]>} */
const externalFiles = new WeakMap()
/** @type {Set<Project>} */
const projects = new Set()

/**
 * @type {PluginModuleFactory}
 */
function plugin(modules) {
  const {typescript: ts} = modules
  let enabled = false

  return {
    create(info) {
      const emptySnapshot = ts.ScriptSnapshot.fromString('')
      const getScriptSnapshot = info.languageServiceHost.getScriptSnapshot.bind(
        info.languageServiceHost
      )

      if (!enabled) {
        return info.languageService
      }

      if (projects.has(info.project)) {
        return info.languageService
      }

      projects.add(info.project)

      const getScriptVersion = info.languageServiceHost.getScriptVersion.bind(
        info.languageServiceHost
      )
      const getScriptKind = info.languageServiceHost.getScriptKind?.bind(
        info.languageServiceHost
      )
      const getProjectVersion =
        info.languageServiceHost.getProjectVersion?.bind(
          info.languageServiceHost
        )

      let initialized = false

      info.languageServiceHost.getScriptSnapshot = (fileName) => {
        if (!initialized && fileName.endsWith('.mdx')) {
          return emptySnapshot
        }

        return getScriptSnapshot(fileName)
      }

      info.languageServiceHost.getScriptVersion = (fileName) => {
        if (!initialized && fileName.endsWith('.mdx')) {
          return 'initializing...'
        }

        return getScriptVersion(fileName)
      }

      if (getScriptKind) {
        info.languageServiceHost.getScriptKind = (fileName) => {
          if (!initialized && fileName.endsWith('.mdx')) {
            return ts.ScriptKind.JSX
          }

          return getScriptKind(fileName)
        }
      }

      if (getProjectVersion) {
        info.languageServiceHost.getProjectVersion = () => {
          if (!initialized) {
            return getProjectVersion() + ',initializing...'
          }

          return getProjectVersion()
        }
      }

      async function loadLanguagePlugins() {
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
          return createMdxLanguagePlugin([
            [remarkFrontmatter, ['toml', 'yaml']],
            remarkGfm
          ])
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

        return createMdxLanguagePlugin(
          plugins || [[remarkFrontmatter, ['toml', 'yaml']], remarkGfm],
          Boolean(commandLine.raw?.mdx?.checkMdx),
          commandLine.options.jsxImportSource
        )
      }

      loadLanguagePlugins().then((languagePlugins) => {
        const files = createFileRegistry(
          [languagePlugins],
          ts.sys.useCaseSensitiveFileNames,
          (fileName) => {
            const snapshot = getScriptSnapshot(fileName)
            if (snapshot) {
              files.set(fileName, resolveCommonLanguageId(fileName), snapshot)
            } else {
              files.delete(fileName)
            }
          }
        )

        decorateLanguageService(files, info.languageService)
        decorateLanguageServiceHost(files, info.languageServiceHost, ts)

        initialized = true
        info.project.markAsDirty()
      })

      return info.languageService
    },

    getExternalFiles(project, updateLevel = 0) {
      if (!enabled) {
        return []
      }

      const oldFiles = externalFiles.get(project)

      if (
        updateLevel >= ts.ProgramUpdateLevel.RootNamesAndUpdate ||
        !oldFiles
      ) {
        const newFiles = searchExternalFiles(ts, project, ['.mdx'])
        externalFiles.set(project, newFiles)
        if (oldFiles && !arrayItemsEqual(oldFiles, newFiles)) {
          project.refreshDiagnostics()
        }

        return newFiles
      }

      return oldFiles
    },

    onConfigurationChanged(config) {
      enabled = Boolean(config.enabled)
      for (const project of projects) {
        project.close()
      }

      projects.clear()
    }
  }
}

module.exports = plugin
