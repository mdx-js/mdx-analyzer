import {createRequire} from 'node:module'
import {URI, Utils} from 'vscode-uri'
import {startLanguageServer} from '@volar/test-utils'
import pkg from '../package.json' with {type: 'json'}

const pkgPath = new URL('../package.json', import.meta.url)
const pkgRequire = createRequire(pkgPath)

const bin = pkgRequire.resolve(pkg.bin['mdx-language-server'])

const fixturesURI = Utils.joinPath(
  URI.parse(import.meta.url),
  '../../../../fixtures'
)

export function createServer() {
  return startLanguageServer(bin, new URL('..', import.meta.url))
}

/**
 * Get the absolute path for a fixture file.
 *
 * @param {string} relativePath - The relative path from the fixtures directory.
 * @returns {string} The absolute path.
 */
export function fixturePath(relativePath) {
  return Utils.joinPath(fixturesURI, relativePath).fsPath
}

/**
 * Get the file URI for a fixture file.
 *
 * @param {string} relativePath - The relative path from the fixtures directory.
 * @returns {string} The file URI.
 */
export function fixtureUri(relativePath) {
  return Utils.joinPath(fixturesURI, relativePath).toString()
}
