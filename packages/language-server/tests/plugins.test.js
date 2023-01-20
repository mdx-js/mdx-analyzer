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

test('frontmatter', async () => {
  await connection.sendRequest(InitializeRequest.type, {
    processId: null,
    rootUri: null,
    capabilities: {}
  })

  const diagnosticsParamsPromise = waitForDiagnostics(connection)
  const textDocument = await openTextDocument(
    connection,
    'frontmatter/frontmatter.mdx'
  )
  const diagnosticsParams = await diagnosticsParamsPromise

  assert.deepEqual(diagnosticsParams, {
    diagnostics: [],
    uri: textDocument.uri
  })
})
