/**
 * @import {CodeMapping} from '@volar/language-service'
 * @import {Nodes} from 'mdast'
 */

/**
 * @typedef VirtualCodeResult
 *   A finalized virtual code fragment with source mappings.
 * @property {string} value
 *   The JavaScript string to insert into the virtual code.
 * @property {CodeMapping[]} mappings
 *   Volar code mappings whose `generatedOffsets` are relative to the start of
 *   `value`, and whose `sourceOffsets` are absolute offsets into the MDX file.
 *   These are rebased onto the embedded JavaScript file by the caller.
 *
 * @typedef VirtualCodePluginObject
 *   An object returned by a virtual code plugin.
 * @property {(node: Nodes) => undefined} [visit]
 *   Visit an mdast node.
 * @property {(mdx: string) => string | VirtualCodeResult} finalize
 *   Generate the JavaScript to insert into the virtual code.
 *
 *   Return a plain string for content that doesn’t need source mappings, or a
 *   {@link VirtualCodeResult} to map generated content back onto the MDX source
 *   (for example, to report diagnostics on frontmatter values). The `mdx`
 *   argument is the full MDX source.
 */

/**
 * @typedef {() => VirtualCodePluginObject} VirtualCodePlugin
 *   An internal plugin for MDX analyzer that represents an MDX plugin.
 */

export {}
