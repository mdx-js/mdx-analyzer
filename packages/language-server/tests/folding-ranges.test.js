/**
 * @typedef {import('vscode-languageserver').ProtocolConnection} ProtocolConnection
 */
import assert from 'node:assert/strict'
import {afterEach, beforeEach, test} from 'node:test'

import {FoldingRangeRequest, InitializeRequest} from 'vscode-languageserver'

import {createConnection, fixtureUri, openTextDocument} from './utils.js'

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
    rootUri: null,
    capabilities: {}
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
      endCharacter: 11,
      endLine: 45,
      kind: 'region',
      startCharacter: 0,
      startLine: 6
    },
    {
      endCharacter: 1,
      endLine: 15,
      kind: 'region',
      startCharacter: 43,
      startLine: 10
    },
    {
      endCharacter: 3,
      endLine: 13,
      kind: 'region',
      startCharacter: 16,
      startLine: 11
    },
    {
      endCharacter: 38,
      endLine: 31,
      kind: 'region',
      startCharacter: 0,
      startLine: 17
    },
    {
      endCharacter: 9,
      endLine: 23,
      kind: 'region',
      startCharacter: 0,
      startLine: 21
    },
    {
      endCharacter: 38,
      endLine: 31,
      kind: 'region',
      startCharacter: 0,
      startLine: 25
    },
    {
      endCharacter: 38,
      endLine: 31,
      kind: 'region',
      startCharacter: 0,
      startLine: 29
    },
    {
      endCharacter: 11,
      endLine: 45,
      kind: 'region',
      startCharacter: 0,
      startLine: 33
    },
    {
      endCharacter: 3,
      endLine: 39,
      kind: 'region',
      startCharacter: 0,
      startLine: 37
    },
    {
      endCharacter: 11,
      endLine: 45,
      kind: 'region',
      startCharacter: 0,
      startLine: 41
    },
    {
      endCharacter: 11,
      endLine: 45,
      kind: 'region',
      startCharacter: 2,
      startLine: 43
    }
  ])
})

test('ignore non-existent mdx files', async () => {
  await connection.sendRequest(InitializeRequest.type, {
    processId: null,
    rootUri: null,
    capabilities: {}
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
    rootUri: null,
    capabilities: {}
  })

  const {uri} = await openTextDocument(connection, 'node16/component.tsx')
  const result = await connection.sendRequest(FoldingRangeRequest.type, {
    textDocument: {uri}
  })

  assert.deepEqual(result, null)
})
