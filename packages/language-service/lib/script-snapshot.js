/**
 * @import {IScriptSnapshot} from 'typescript'
 */

/**
 * A TypeScript compatible script snapshot that wraps a string of text.
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
  // eslint-disable-next-line class-methods-use-this
  getChangeRange() {
    // Not implemented
  }

  /**
   * @returns {number}
   *   The snapshot text length.
   */
  getLength() {
    return this.text.length
  }

  /**
   * @param {number} start
   *   The start offset of the range to get.
   * @param {number} end
   *   The end offset of the range to get.
   * @returns {string}
   *   The slice of the string that matches the start and end offset.
   */
  getText(start, end) {
    return this.text.slice(start, end)
  }
}
