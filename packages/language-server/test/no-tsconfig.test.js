/**
 * @typedef {import('@volar/language-server').ProtocolConnection} ProtocolConnection
 */
import assert from 'node:assert/strict'
import {afterEach, beforeEach, test} from 'node:test'
import {InitializeRequest} from '@volar/language-server'
import {
  createConnection,
  openTextDocument,
  waitForDiagnostics,
  tsdk,
  fixtureUri
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
    rootUri: fixtureUri('no-tsconfig'),
    capabilities: {},
    initializationOptions: {typescript: {tsdk}}
  })

  const diagnosticsPromise = waitForDiagnostics(connection)
  const textDocument = await openTextDocument(
    connection,
    'no-tsconfig/readme.mdx',
    'mdx'
  )
  const diagnostics = await diagnosticsPromise

  assert.deepEqual(diagnostics, {
    diagnostics: [],
    uri: textDocument.uri,
    version: 1
  })
})
