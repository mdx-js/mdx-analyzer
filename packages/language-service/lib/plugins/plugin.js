/**
 * @import {Nodes} from 'mdast'
 */

/**
 * @typedef VirtualCodePluginObject
 *   An object returned by a virtual code plugin.
 * @property {(node: Nodes) => undefined} [visit]
 *   Visit an mdast node.
 * @property {() => string} finalize
 *   Generate the JavaScript string to insert into the virtual code.
 */

/**
 * @typedef {() => VirtualCodePluginObject} VirtualCodePlugin
 *   An internal plugin for MDX analyzer that represents an MDX plugin.
 */

export {}
