/**
 * @typedef {import('typescript').server.Project} Project
 * @typedef {import('typescript').server.PluginModuleFactory} PluginModuleFactory
 * @typedef {import('typescript').LanguageService} LanguageService
 */

import {
  decorateLanguageService,
  decorateLanguageServiceHost,
  searchExternalFiles
} from '@volar/typescript'
import {createFileProvider, resolveCommonLanguageId} from '@volar/language-core'
import {getLanguageModule} from '@mdx-js/language-service'
import {loadPlugins} from '../../language-server/lib/configuration.js'

/**
 * @type {WeakMap<Project, string[]>}
 */
const externalFiles = new WeakMap()

/**
 * @type {PluginModuleFactory} modules
 */
function init(modules) {
  const {typescript: ts} = modules
  return {
    create(info) {
      const emptySnapshot = ts.ScriptSnapshot.fromString('')
      const getScriptSnapshot = info.languageServiceHost.getScriptSnapshot.bind(info.languageServiceHost)
      const getScriptVersion = info.languageServiceHost.getScriptVersion.bind(info.languageServiceHost)
      const getScriptKind = info.languageServiceHost.getScriptKind?.bind(info.languageServiceHost)
      const getProjectVersion = info.languageServiceHost.getProjectVersion?.bind(info.languageServiceHost)
      const configFileName = info.project.projectKind === ts.server.ProjectKind.Configured
        ? info.project.getProjectName()
        : undefined

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
            return ts.ScriptKind.JSX // TODO
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

      let initialized = false

      loadPlugins(configFileName, ts).then((plugins) => {
        const files = createFileProvider(
          [getLanguageModule(ts, plugins)],
          ts.sys.useCaseSensitiveFileNames,
          (fileName) => {
            const snapshot = getScriptSnapshot(fileName)
            if (snapshot) {
              files.updateSourceFile(
                fileName,
                resolveCommonLanguageId(fileName),
                snapshot
              )
            } else {
              files.deleteSourceFile(fileName)
            }
          }
        )

        decorateLanguageService(files, info.languageService, true)
        decorateLanguageServiceHost(files, info.languageServiceHost, ts, ['.mdx'])

        info.project.markAsDirty()
        initialized = true
      })

      return info.languageService
    },
    getExternalFiles(project, updateLevel = 0) {
      let files = externalFiles.get(project)

      if (updateLevel >= 1 || !files) {
        files = searchExternalFiles(ts, project, ['.mdx'])
        externalFiles.set(project, files)
        project.refreshDiagnostics()
      }

      return files
    }
  }
}

module.exports = init
