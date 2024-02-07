import {createAsyncLanguageServicePlugin} from '@volar/typescript/lib/quickstart/createAsyncLanguageServicePlugin.js'
import {loadMdxLanguagePlugin} from '../../language-server/lib/load-language-plugin.js'

module.exports = createAsyncLanguageServicePlugin(
  ['.mdx'],
  2 /* JSX */,
  async (ts, info) => {
    const configFileName =
      info.project.projectKind === ts.server.ProjectKind.Configured
        ? info.project.getProjectName()
        : undefined
    return [await loadMdxLanguagePlugin(ts, configFileName)]
  }
)
