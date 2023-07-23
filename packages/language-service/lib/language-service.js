/**
 * @typedef {import('@volar/language-service').Config} Config
 * @typedef {import('unified').PluggableList} PluggableList
 */

import createTypeScriptService from 'volar-service-typescript'
import {getLanguageModule} from './language-module.js'
import {createMarkdownService} from './volar-service-markdown/index.cjs'
import {createYamlService} from './volar-service-yaml/index.js'

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
  config.services.typescript = createTypeScriptService.default()
  config.services.markdown = createMarkdownService()
  config.services.yaml = createYamlService()

  return config
}
