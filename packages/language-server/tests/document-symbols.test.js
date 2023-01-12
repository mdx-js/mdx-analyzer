/**
 * @typedef {import('vscode-languageserver').ProtocolConnection} ProtocolConnection
 */
import assert from 'node:assert/strict'
import {afterEach, beforeEach, test} from 'node:test'

import {
  DocumentSymbolRequest,
  InitializeRequest,
  SymbolKind
} from 'vscode-languageserver'

import {createConnection, openTextDocument} from './utils.js'

/** @type {ProtocolConnection} */
let connection

beforeEach(() => {
  connection = createConnection()
})

afterEach(() => {
  connection.dispose()
})

test('resolve document symbols', async () => {
  await connection.sendRequest(InitializeRequest.type, {
    processId: null,
    rootUri: null,
    capabilities: {}
  })

  const {uri} = await openTextDocument(connection, 'node16/mixed.mdx')
  const result = await connection.sendRequest(DocumentSymbolRequest.type, {
    textDocument: {uri}
  })

  assert.deepEqual(result, [
    {
      children: [],
      kind: SymbolKind.Function,
      name: 'exportedFunction',
      range: {
        end: {line: 9, character: 1},
        start: {line: 4, character: 0}
      },
      selectionRange: {
        end: {line: 9, character: 1},
        start: {line: 4, character: 0}
      }
    }
  ])
})
