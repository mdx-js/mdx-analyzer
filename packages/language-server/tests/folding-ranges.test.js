/**
 * @typedef {import('vscode-languageserver').ProtocolConnection} ProtocolConnection
 */
import assert from 'node:assert/strict'
import {afterEach, beforeEach, test} from 'node:test'
import {FoldingRangeRequest, InitializeRequest} from 'vscode-languageserver'
import {createConnection, fixtureUri, openTextDocument, tsdk} from './utils.js'

/** @type {ProtocolConnection} */
let connection

beforeEach(() => {
  connection = createConnection()
})

afterEach(() => {
  connection.dispose()
})

test('resolve folding ranges', async () => {
  await connection.sendRequest(InitializeRequest.type, {
    processId: null,
    rootUri: fixtureUri('node16'),
    capabilities: {},
    initializationOptions: {typescript: {tsdk}}
  })

  const {uri} = await openTextDocument(connection, 'node16/mixed.mdx')
  const result = await connection.sendRequest(FoldingRangeRequest.type, {
    textDocument: {uri}
  })

  assert.deepEqual(result, [
    {
      endCharacter: 4,
      endLine: 4,
      kind: 'comment',
      startCharacter: 1,
      startLine: 2
    },
    {
      endCharacter: 10,
      endLine: 14,
      startCharacter: 43,
      startLine: 10
    },
    {
      endCharacter: 12,
      endLine: 12,
      startCharacter: 16,
      startLine: 11
    },
    {
      endLine: 45,
      startLine: 6
    },
    {
      endLine: 31,
      startLine: 17
    },
    {
      endLine: 23,
      startLine: 21
    },
    {
      endLine: 31,
      startLine: 25
    },
    {
      endLine: 31,
      startLine: 29
    },
    {
      endLine: 42,
      startLine: 33
    },
    {
      endLine: 45,
      startLine: 43
    },
    {
      endLine: 39,
      startLine: 37
    },
    {
      endLine: 45,
      startLine: 41
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
  const result = await connection.sendRequest(FoldingRangeRequest.type, {
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
  const result = await connection.sendRequest(FoldingRangeRequest.type, {
    textDocument: {uri}
  })

  assert.deepEqual(result, null)
})
