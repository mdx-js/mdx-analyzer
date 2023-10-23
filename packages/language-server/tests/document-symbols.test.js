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
import {createConnection, fixtureUri, openTextDocument, tsdk} from './utils.js'

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
    rootUri: fixtureUri('node16'),
    capabilities: {},
    initializationOptions: {typescript: {tsdk}}
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
        end: {line: 15, character: 1},
        start: {line: 10, character: 0}
      },
      selectionRange: {
        end: {line: 10, character: 32},
        start: {line: 10, character: 16}
      }
    }
  ])
})

test('ignore non-existent mdx files', async () => {
  await connection.sendRequest(InitializeRequest.type, {
    processId: null,
    rootUri: fixtureUri('node16'),
    capabilities: {},
    initializationOptions: {typescript: {tsdk}}
  })

  const uri = fixtureUri('node16/non-existent.mdx')
  const result = await connection.sendRequest(DocumentSymbolRequest.type, {
    textDocument: {uri}
  })

  assert.deepEqual(result, null)
})

test('ignore non-mdx files', async () => {
  await connection.sendRequest(InitializeRequest.type, {
    processId: null,
    rootUri: fixtureUri('node16'),
    capabilities: {},
    initializationOptions: {typescript: {tsdk}}
  })

  const {uri} = await openTextDocument(connection, 'node16/component.tsx')
  const result = await connection.sendRequest(DocumentSymbolRequest.type, {
    textDocument: {uri}
  })

  assert.deepEqual(result, null)
})
