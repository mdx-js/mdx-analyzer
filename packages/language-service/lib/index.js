/**
 * @typedef {import('./plugins/plugin.js').VirtualCodePlugin} VirtualCodePlugin
 * @typedef {import('./language-plugins/resolver.js').LanguagePluginLoadError} LanguagePluginLoadError
 * @typedef {import('./language-plugins/resolver.js').ResolveLanguagePluginsResult} ResolveLanguagePluginsResult
 */

export {createMdxLanguagePlugin} from './language-plugin.js'
export {createMdxServicePlugin} from './service-plugin.js'
export {resolvePlugins, resolveLanguagePlugins} from './tsconfig.js'
