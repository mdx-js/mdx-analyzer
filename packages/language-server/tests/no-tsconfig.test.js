/**
 * @typedef {import('vscode-languageserver').ProtocolConnection} ProtocolConnection
 */
import assert from 'node:assert/strict'
import {afterEach, beforeEach, test} from 'node:test'

import {InitializeRequest} from 'vscode-languageserver'

import {
  createConnection,
  openTextDocument,
  waitForDiagnostics
} from './utils.js'

/** @type {ProtocolConnection} */
let connection

beforeEach(() => {
  connection = createConnection()
})

afterEach(() => {
  connection.dispose()
})

test('no tsconfig exists', async () => {
  await connection.sendRequest(InitializeRequest.type, {
    processId: null,
    rootUri: null,
    capabilities: {}
  })

  const diagnosticsPromise = waitForDiagnostics(connection)
  const textDocument = await openTextDocument(
    connection,
    'no-tsconfig/readme.mdx'
  )
  const diagnostics = await diagnosticsPromise

  assert.deepEqual(diagnostics, {
    diagnostics: [],
    uri: textDocument.uri
  })
})
