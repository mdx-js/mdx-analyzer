/**
 * @typedef {import('@volar/language-service').Config} Config
 * @typedef {import('unified').PluggableList} PluggableList
 */

import {create as createMarkdownService} from 'volar-service-markdown'
import {create as createTypeScriptService} from 'volar-service-typescript'
import {getLanguageModule} from './language-module.js'

/**
 * @param {Config} config
 * @param {typeof import('typescript')} ts
 * @param {PluggableList | undefined} [plugins]
 * @returns {Config}
 */
export function resolveConfig(config, ts, plugins) {
  config.languages ||= {}
  config.languages.mdx ||= getLanguageModule(ts, plugins)

  config.services ||= {}
  config.services.markdown = createMarkdownService()
  config.services.typescript = createTypeScriptService()

  return config
}
