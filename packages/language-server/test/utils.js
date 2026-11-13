import {createRequire} from 'node:module'
import {dirname} from 'node:path'

import {startLanguageServer} from '@volar/test-utils'
import {URI, Utils} from 'vscode-uri'

import pkg from '../package.json' with {type: 'json'}

const require = createRequire(import.meta.url)
const pkgPath = new URL('../package.json', import.meta.url)
const pkgRequire = createRequire(pkgPath)

const bin = pkgRequire.resolve(pkg.bin['mdx-language-server'])

const fixturesURI = Utils.joinPath(
  URI.parse(import.meta.url),
  '../../../../fixtures'
)

/**
 * The path to the TypeScript SDK.
 */
export const tsdk = dirname(require.resolve('typescript'))

export function createServer() {
  return startLanguageServer(bin, new URL('..', import.meta.url))
}

/**
 * @param {string} fileName
 *   The name of the fixture to get a fully resolved URI for.
 * @returns {string}
 *   The uri that matches the fixture file name.
 */
export function fixtureUri(fileName) {
  return `${fixturesURI}/${fileName}`
}

/**
 * @param {string} fileName
 *   The file name of the fixture to get.
 * @returns {string}
 *   A path for the ficture.
 */
export function fixturePath(fileName) {
  return URI.parse(fixtureUri(fileName)).fsPath.replaceAll('\\', '/')
}
