/**
 * @typedef {import('vscode-languageserver').ProtocolConnection} ProtocolConnection
 */
import assert from 'node:assert/strict'
import {afterEach, beforeEach, test} from 'node:test'
import {CompletionRequest, InitializeRequest} from 'vscode-languageserver'
import {createConnection, fixtureUri, openTextDocument} from './utils.js'

/** @type {ProtocolConnection} */
let connection

beforeEach(() => {
  connection = createConnection()
})

afterEach(() => {
  connection.dispose()
})

test('support completion in ESM', async () => {
  await connection.sendRequest(InitializeRequest.type, {
    processId: null,
    rootUri: null,
    capabilities: {}
  })

  const {uri} = await openTextDocument(connection, 'node16/completion.mdx')
  const result = await connection.sendRequest(CompletionRequest.type, {
    position: {line: 1, character: 1},
    textDocument: {uri}
  })

  assert.ok(result)
  assert.ok('items' in result)
  const completion = result.items.find((r) => r.insertText === 'Boolean')
  assert.deepEqual(completion, {
    data: {
      offset: 30,
      uri: fixtureUri('node16/completion.mdx')
    },
    insertText: 'Boolean',
    kind: 6,
    label: 'Boolean',
    sortText: '15',
    tags: []
  })
})

test('support completion in JSX', async () => {
  await connection.sendRequest(InitializeRequest.type, {
    processId: null,
    rootUri: null,
    capabilities: {}
  })

  const {uri} = await openTextDocument(connection, 'node16/completion.mdx')
  const result = await connection.sendRequest(CompletionRequest.type, {
    position: {line: 5, character: 3},
    textDocument: {uri}
  })

  assert.ok(result)
  assert.ok('items' in result)
  const completion = result.items.find((r) => r.insertText === 'Boolean')
  assert.deepEqual(completion, {
    data: {
      offset: 77,
      uri: fixtureUri('node16/completion.mdx')
    },
    insertText: 'Boolean',
    kind: 6,
    label: 'Boolean',
    sortText: '15',
    tags: []
  })
})

test('ignore completion in markdown content', async () => {
  await connection.sendRequest(InitializeRequest.type, {
    processId: null,
    rootUri: null,
    capabilities: {}
  })

  const {uri} = await openTextDocument(connection, 'node16/completion.mdx')
  const result = await connection.sendRequest(CompletionRequest.type, {
    position: {line: 8, character: 10},
    textDocument: {uri}
  })

  assert.deepEqual(result, null)
})
