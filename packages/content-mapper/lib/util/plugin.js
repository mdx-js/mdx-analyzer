/**
 * @import { Token } from 'micromark-util-types'
 * @import { Chunk } from './chunk.js'
 */

/**
 * @typedef VirtualCodePluginObject
 *   An object returned by a virtual code plugin.
 * @property {(token: Token) => string | undefined} [enter]
 *   Enter a micromark token. This is tyically used to collect data.
 * @property {(token: Token) => string | undefined} [exit]
 *   Exit a micromark token. This is tyically used to collect data.
 * @property {() => undefined} [finalize]
 *   A final operation. This is typically used to inject virtual content.
 */

/**
 * @callback VirtualCodePluginFunction
 * @param {string} content
 * @param {Chunk} esm
 * @returns {VirtualCodePluginObject}
 */

/**
 * @callback VirtualCodePlugin
 *   An internal plugin for MDX analyzer that represents an MDX plugin.
 * @param {unknown} options
 * @returns {VirtualCodePluginFunction}
 */

/** @type {Map<string, VirtualCodePlugin>} */
export const knownPlugins = new Map()

/**
 * Register a well-known MDX plugin.
 *
 * @param {string} name
 *   The name of the plugin.
 * @param {VirtualCodePlugin} plugin
 *   The implementation of the plugin.
 */
export function definePlugin(name, plugin) {
  knownPlugins.set(name, plugin)
}
