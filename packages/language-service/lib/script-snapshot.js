/**
 * @import {IScriptSnapshot} from 'typescript'
 */

/**
 * A TypeScript compatible script snapshot that wraps a string of text.
 *
 * @implements {IScriptSnapshot}
 */
export class ScriptSnapshot {
  /**
   * @param {string} text
   *   The text to wrap.
   */
  constructor(text) {
    this.text = text
  }

  /**
   * Not implemented.
   *
   * @returns {undefined}
   */
  getChangeRange() {}

  /**
   * @returns {number}
   */
  getLength() {
    return this.text.length
  }

  /**
   * @param {number} start
   * @param {number} end
   * @returns {string}
   */
  getText(start, end) {
    return this.text.slice(start, end)
  }
}
