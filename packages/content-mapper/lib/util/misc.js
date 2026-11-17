/**
 * @import { MappedOutput } from '../protocol.js'
 */

import assert from 'node:assert/strict'
import {dirname, relative, resolve} from 'node:path/posix'

/**
 * @typedef {(number | string)[]} Path
 *   A JSON path.
 */

/** @type {Map<string, MappedOutput['extension']>} */
export const codeExtensions = new Map([
  ['cjs', '.cjs'],
  ['cts', '.cts'],
  ['javascript', '.js'],
  ['javascriptreact', '.jsx'],
  ['js', '.js'],
  ['json', '.json'],
  ['jsonc', '.json'],
  ['jsx', '.jsx'],
  ['mjs', '.mjs'],
  ['mts', '.mts'],
  ['ts', '.ts'],
  ['tsx', '.tsx'],
  ['typescript', '.ts'],
  ['typescriptreact', '.tsx']
])

/**
 * Assert that a function is not nullish.
 *
 * @template T
 *   The type of the expected value
 * @param {T | null | undefined | void} value
 *   The value that might be nullish.
 * @returns {T}
 *   The value if it’s not nullish.
 */
export function nonNull(value) {
  assert.ok(value != null, 'Expected value to be defined')
  return value
}

/**
 * Check if the file name matches one of the given extensions.
 *
 * @param {string} fileName
 *   The file name to check.
 * @param {string[]} extensions
 *   The allowed extensions.
 * @returns {boolean}
 *   Whether or not the file name matches any of the extensions.
 */
export function hasExtension(fileName, extensions) {
  return extensions.some((extension) => fileName.endsWith(extension))
}

/**
 * Check if a string if a file extension.
 *
 * @param {string} extension
 *   The string to check.
 * @returns {boolean}
 *   Whether or not the input is a file extension.
 */
export function isExtension(extension) {
  return /\.\w+$/.test(extension)
}

/**
 * Check whether a value is an object.
 *
 * @param {unknown} value
 *   The value to check.
 * @returns {value is Record<string, unknown>}
 *   Whether or not the value is an object.
 */
export function isObject(value) {
  return typeof value === 'object' && value != null
}

/**
 * Represent a JSON path to a human readable string.
 *
 * @param {Path} path
 *   The JSON path to join.
 * @returns {string}
 *   A string representation of the JSON path.
 */
export function joinPath(path) {
  let result = ''

  for (const item of path) {
    if (typeof item === 'number') {
      result += `[${item}]`
    } else if (result) {
      result += `.${item}`
    } else {
      result = item
    }
  }

  return result
}

/**
 * Resolve a provider import source for a file name, relative to the config file name.
 *
 * A user may specify `providerImportSource` as a relative path in a TypeScript configuration file.
 * This function transforms it, so it becomes relative to the file to transform instead.
 *
 * @param {string} fileName
 *   The file name of the source file.
 * @param {string | undefined} configFileName
 *   The file name of the TypeScript configuration.
 * @param {unknown} providerImportSource
 *   The provider import source that was specified by the user.
 * @returns {string | undefined}
 *   The relative import source, or undefined.
 */
export function resolveProviderImportSource(
  fileName,
  configFileName,
  providerImportSource
) {
  if (typeof providerImportSource !== 'string') {
    return
  }

  if (!providerImportSource) {
    return
  }

  if (
    !providerImportSource.startsWith('./') &&
    !providerImportSource.startsWith('../')
  ) {
    return providerImportSource
  }

  if (!configFileName) {
    return
  }

  const absolute = resolve(dirname(configFileName), providerImportSource)
  const rel = relative(dirname(fileName), absolute)
  return rel.startsWith('../') ? rel : `./${rel}`
}
