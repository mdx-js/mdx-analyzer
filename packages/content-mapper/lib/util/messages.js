/**
 * @import { Path } from './misc.js'
 * @import { OptionDiagnostic } from '../protocol.js'
 */

import {joinPath} from './misc.js'

// ---------------------------- //
// Generic configuration errors //
// ---------------------------- //

/**
 * Get the diagnostic of an option type error.
 *
 * @param {Path} path
 *   The JSON path where the error occurs.
 * @param {string} type
 *   The expected type.
 * @returns {OptionDiagnostic}
 *   The diagnostic.
 */
export function typeError(path, type) {
  return {
    path,
    messageText: `Content mapper option '${joinPath(path)}' requires a value of type ${type}.`,
    code: 1001
  }
}

/**
 * Get an error for an content mapper option that depends on a TypeScript compiler option.
 *
 * @param {Path} path
 *   The JSON path where the error occurs.
 * @param {string} compilerOption
 *   The name of the compiler option the content mapper option depends on.
 * @returns {OptionDiagnostic}
 *   The diagnostic.
 */
export function dependsCompilerOption(path, compilerOption) {
  return {
    path,
    messageText: `Content mapper option '${joinPath(path)}' cannot be specified without specifying compiler option '${compilerOption}'.`,
    code: 1002
  }
}

/**
 * Get the error message of a value that should be a file extension.
 *
 * @param {Path} path
 *   The JSON path where the error occurs.
 * @param {string} value
 *   The value as specified by the user.
 * @returns {OptionDiagnostic}
 *   The diagnostic.
 */
export function expectExtension(path, value) {
  return {
    path,
    messageText: `File extension '${value}' must begin with a '.'.`,
    code: 1003
  }
}

/**
 * Get the error message of a value that should match an enum.
 *
 * @param {Path} path
 *   The JSON path where the error occurs.
 * @param {unknown[]} allowed
 *   The allowed values.
 * @returns {OptionDiagnostic}
 *   The diagnostic.
 */
export function enumError(path, allowed) {
  return {
    path,
    messageText: `Content mapper option '${joinPath(path)}' must be one of ${allowed.map((value) => `'${value}'`).join(', ')}.`,
    code: 1001
  }
}

// ---------------------------- //
// Plugin errors                //
// ---------------------------- //

/**
 * Get the error message of an unplugin.
 *
 * @param {Path} path
 *   The JSON path where the error occurs.
 * @param {string} value
 *   The value as specified by the user.
 * @returns {OptionDiagnostic}
 *   The diagnostic.
 */
export function unknownPluginError(path, value) {
  return {
    path,
    messageText: `Unknown plugin '${value}'.`,
    code: 2001
  }
}

/**
 * Get the error message of a plugin that could not be resolved.
 *
 * @param {Path} path
 *   The JSON path where the error occurs.
 * @param {string} value
 *   The value as specified by the user.
 * @returns {OptionDiagnostic}
 *   The diagnostic.
 */
export function unresolvedPluginError(path, value) {
  return {
    path,
    messageText: `Failed to load plugin '${value}'.`,
    code: 2001
  }
}
