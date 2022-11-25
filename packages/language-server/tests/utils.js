/**
 * @typedef {import('vscode-languageserver').TextDocumentItem} TextDocumentItem
 * @typedef {import('vscode-languageserver').ProtocolConnection} ProtocolConnection
 */

import { spawn } from 'node:child_process'
import fs from 'node:fs/promises'

import {
  createProtocolConnection,
  DidOpenTextDocumentNotification,
  IPCMessageReader,
  IPCMessageWriter,
} from 'vscode-languageserver/node.js'

const TEST_TIMEOUT = 3e3

/**
 * @returns {ProtocolConnection}
 * The protocol connection for the MDX language server.
 *
 * The language server is launched using the IPC protocol.
 */
export function createConnection() {
  const proc = spawn('mdx-language-server', ['--node-ipc'], {
    cwd: new URL('..', import.meta.url),
    stdio: ['inherit', 'inherit', 'inherit', 'ipc'],
  })
  const connection = createProtocolConnection(
    new IPCMessageReader(proc),
    new IPCMessageWriter(proc),
  )

  const timeout = setTimeout(() => {
    connection.dispose()
  }, TEST_TIMEOUT)

  connection.listen()
  connection.onDispose(() => {
    clearTimeout(timeout)
    proc.kill()
    connection.end()
  })

  return connection
}

/**
 * @param {string} fileName The name of the fixture to get a fully resolved URI for.
 * @returns {string} The uri that matches the fixture file name.
 */
export function fixtureUri(fileName) {
  return String(new URL(`fixtures/${fileName}`, import.meta.url))
}

/**
 * Make the LSP connection open a file.
 *
 * @param {ProtocolConnection} connection The LSP connection to use.
 * @param {string} fileName The file path to open relative to the `fixtures` directory.
 * @returns {Promise<TextDocumentItem>} The text document that was sent to the server.
 */
export async function openTextDocument(connection, fileName) {
  const url = new URL(`fixtures/${fileName}`, import.meta.url)
  const uri = String(url)
  const text = await fs.readFile(url, 'utf8')
  /** @type {TextDocumentItem} */
  const textDocument = {
    languageId: 'mdx',
    text,
    uri,
    version: 1,
  }

  connection.sendNotification(DidOpenTextDocumentNotification.type, {
    textDocument,
  })

  return textDocument
}
