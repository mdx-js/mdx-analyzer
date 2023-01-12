/**
 * @typedef {import('typescript').DiagnosticWithLocation} DiagnosticWithLocation
 * @typedef {import('vfile-message').VFileMessage} VFileMessage
 */

/**
 * Check whether or not an object is a vfile message.
 *
 * @param {unknown} object
 *   The object to check.
 * @returns {object is VFileMessage}
 *   Whether or not the object is a vfile message.
 */
function isVFileMessage(object) {
  if (typeof object !== 'object') {
    return false
  }

  if (!object) {
    return false
  }

  const message = /** @type {VFileMessage | Record<string, unknown>} */ (object)
  return typeof message.message === 'string'
}

/**
 * Represent an error as a TypeScript diagnostic.
 *
 * @param {import('typescript')} ts
 *   The TypeScript module to use.
 * @param {unknown} error
 *   The error to represent.
 * @returns {[DiagnosticWithLocation]}
 *   The error as a TypeScript diagnostic.
 */
export function toDiagnostic(ts, error) {
  let start = 0
  let length = 1
  let messageText = 'An unexpecter parsing error occurred'
  if (isVFileMessage(error)) {
    start = error.position?.start?.offset ?? 0
    length = (error.position?.end?.offset ?? start) - start
    messageText = error.reason
  }

  return [
    {
      category: ts.DiagnosticCategory.Error,
      // @ts-expect-error A number is expected, but it’s only used for display purposes.
      code: 'MDX',
      messageText,
      // @ts-expect-error We don’t use file.
      file: undefined,
      start,
      length
    }
  ]
}
