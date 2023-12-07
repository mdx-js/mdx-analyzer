/**
 * @typedef {import('@volar/language-server').TextDocumentItem} TextDocumentItem
 * @typedef {import('@volar/language-server').ProtocolConnection} ProtocolConnection
 * @typedef {import('@volar/language-server').PublishDiagnosticsParams} PublishDiagnosticsParams
 */

import {spawn} from 'node:child_process'
import fs from 'node:fs/promises'
import {createRequire} from 'node:module'
import path from 'node:path'
import {fileURLToPath} from 'node:url'
import {
  createProtocolConnection,
  DidOpenTextDocumentNotification,
  IPCMessageReader,
  IPCMessageWriter,
  PublishDiagnosticsNotification
} from '@volar/language-server/node.js'
import {URI} from 'vscode-uri'
// eslint-disable-next-line import/order
import normalizePath from 'normalize-path'

const require = createRequire(import.meta.url)
const pkgPath = new URL('../package.json', import.meta.url)
const pkgRequire = createRequire(pkgPath)
const pkg = require('../package.json')

const bin = pkgRequire.resolve(pkg.bin['mdx-language-server'])

/**
 * The path to the TypeScript SDK.
 */
export const tsdk = path.dirname(require.resolve('typescript'))

/**
 * @returns {ProtocolConnection}
 * The protocol connection for the MDX language server.
 *
 * The language server is launched using the IPC protocol.
 */
export function createConnection() {
  const proc = spawn('node', [bin, '--node-ipc'], {
    cwd: new URL('..', import.meta.url),
    stdio: ['inherit', 'inherit', 'inherit', 'ipc']
  })
  const connection = createProtocolConnection(
    new IPCMessageReader(proc),
    new IPCMessageWriter(proc)
  )

  connection.listen()
  connection.onDispose(() => {
    proc.kill()
  })

  return connection
}

/**
 * @param {string} fileName The name of the fixture to get a fully resolved URI for.
 * @returns {string} The uri that matches the fixture file name.
 */
export function fixtureUri(fileName) {
  return URI.parse(String(new URL(`../../../fixtures/${fileName}`, import.meta.url))).toString()
}

/**
 * @param {string} fileName
 * @returns {string}
 */
export function fixturePath(fileName) {
  return normalizePath(fileURLToPath(fixtureUri(fileName)))
}

/**
 * Make the LSP connection open a file.
 *
 * @param {ProtocolConnection} connection The LSP connection to use.
 * @param {string} fileName The file path to open relative to the `fixtures` directory.
 * @returns {Promise<TextDocumentItem>} The text document that was sent to the server.
 */
export async function openTextDocument(connection, fileName) {
  const url = new URL(`../../../fixtures/${fileName}`, import.meta.url)
  const uri = URI.parse(String(url)).toString()
  const text = await fs.readFile(url, 'utf8')
  /** @type {TextDocumentItem} */
  const textDocument = {
    languageId: 'mdx',
    text,
    uri,
    version: 1
  }

  connection.sendNotification(DidOpenTextDocumentNotification.type, {
    textDocument
  })

  return textDocument
}

/**
 * @param {ProtocolConnection} connection
 * @returns {Promise<PublishDiagnosticsParams>}
 */
export function waitForDiagnostics(connection) {
  return new Promise((resolve) => {
    connection.onNotification(PublishDiagnosticsNotification.type, resolve)
  })
}
