import {createAsyncTSServerPlugin} from '@volar/typescript/lib/starters/createAsyncTSServerPlugin.js'
import {createMdxLanguagePlugin} from '@mdx-js/language-service'
import {loadPlugins} from '../../language-server/lib/configuration.js'

module.exports = createAsyncTSServerPlugin(
  ['.mdx'],
  2 /* JSX */,
  async (ts, info) => {
    const configFileName =
      info.project.projectKind === ts.server.ProjectKind.Configured
        ? info.project.getProjectName()
        : undefined
    const plugins = await loadPlugins(configFileName, ts)
    return [createMdxLanguagePlugin(plugins)]
  }
)
