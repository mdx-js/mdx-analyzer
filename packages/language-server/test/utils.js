/**
 * @typedef {import('@volar/language-server').TextDocumentItem} TextDocumentItem
 * @typedef {import('@volar/language-server').PublishDiagnosticsParams} PublishDiagnosticsParams
 */

import {createRequire} from 'node:module'
import path from 'node:path'
import {fileURLToPath} from 'node:url'
import {URI, Utils} from 'vscode-uri'
import {startLanguageServer} from '@volar/test-utils'
// eslint-disable-next-line import/order
import normalizePath from 'normalize-path'

const require = createRequire(import.meta.url)
const pkgPath = new URL('../package.json', import.meta.url)
const pkgRequire = createRequire(pkgPath)
const pkg = require('../package.json')

const bin = pkgRequire.resolve(pkg.bin['mdx-language-server'])

const fixturesURI = Utils.joinPath(
  URI.parse(import.meta.url),
  '../../../../fixtures'
)

/**
 * The path to the TypeScript SDK.
 */
export const tsdk = path.dirname(require.resolve('typescript'))

export function createServer() {
  return startLanguageServer(bin, new URL('..', import.meta.url))
}

/**
 * @param {string} fileName The name of the fixture to get a fully resolved URI for.
 * @returns {string} The uri that matches the fixture file name.
 */
export function fixtureUri(fileName) {
  return fixturesURI + '/' + fileName
}

/**
 * @param {string} fileName
 * @returns {string}
 */
export function fixturePath(fileName) {
  return normalizePath(fileURLToPath(fixtureUri(fileName)))
}
