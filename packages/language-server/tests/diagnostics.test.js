/**
 * @typedef {import('vscode-languageserver').ProtocolConnection} ProtocolConnection
 */
import assert from 'node:assert/strict'
import {afterEach, beforeEach, test} from 'node:test'

import {InitializeRequest} from 'vscode-languageserver'

import {
  createConnection,
  fixtureUri,
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

test('type errors', async () => {
  await connection.sendRequest(InitializeRequest.type, {
    processId: null,
    rootUri: null,
    capabilities: {}
  })

  const diagnosticsPromise = waitForDiagnostics(connection)
  const textDocument = await openTextDocument(
    connection,
    'node16/type-errors.mdx'
  )
  const diagnostics = await diagnosticsPromise

  assert.deepEqual(diagnostics, {
    uri: textDocument.uri,
    diagnostics: [
      {
        code: 'ts2568',
        message:
          "Property 'counts' may not exist on type 'Props'. Did you mean 'count'?",
        range: {
          start: {line: 6, character: 15},
          end: {line: 6, character: 21}
        },
        relatedInformation: [
          {
            location: {
              range: {
                end: {line: 12, character: 2},
                start: {line: 11, character: 4}
              },
              uri: fixtureUri('node16/type-errors.mdx')
            },
            message: "'count' is declared here."
          }
        ],
        severity: 4,
        tags: []
      },
      {
        code: 'ts2568',
        message:
          "Property 'counter' may not exist on type 'Props'. Did you mean 'count'?",
        range: {
          start: {line: 14, character: 51},
          end: {line: 14, character: 58}
        },
        relatedInformation: [
          {
            location: {
              range: {
                start: {line: 11, character: 4},
                end: {line: 12, character: 2}
              },
              uri: fixtureUri('node16/type-errors.mdx')
            },
            message: "'count' is declared here."
          }
        ],
        severity: 4,
        tags: []
      }
    ]
  })
})
