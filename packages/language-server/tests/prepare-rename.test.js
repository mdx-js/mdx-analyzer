/**
 * @typedef {import('vscode-languageserver').ProtocolConnection} ProtocolConnection
 */
import assert from 'node:assert/strict'
import {afterEach, beforeEach, test} from 'node:test'

import {InitializeRequest, PrepareRenameRequest} from 'vscode-languageserver'

import {createConnection, openTextDocument} from './utils.js'

/** @type {ProtocolConnection} */
let connection

beforeEach(() => {
  connection = createConnection()
})

afterEach(() => {
  connection.dispose()
})

test('handle prepare rename request of variable', async () => {
  await connection.sendRequest(InitializeRequest.type, {
    processId: null,
    rootUri: null,
    capabilities: {}
  })

  const {uri} = await openTextDocument(connection, 'node16/a.mdx')
  const result = await connection.sendRequest(PrepareRenameRequest.type, {
    position: {line: 4, character: 3},
    textDocument: {uri}
  })

  assert.deepEqual(result, {
    start: {line: 4, character: 2},
    end: {line: 4, character: 3}
  })
})

test('handle unknown rename request', async () => {
  await connection.sendRequest(InitializeRequest.type, {
    processId: null,
    rootUri: null,
    capabilities: {}
  })

  const {uri} = await openTextDocument(connection, 'node16/a.mdx')
  const result = await connection.sendRequest(PrepareRenameRequest.type, {
    position: {line: 0, character: 1},
    textDocument: {uri}
  })

  assert.deepEqual(result, null)
})

test('ignore non-existent mdx files', async () => {
  await connection.sendRequest(InitializeRequest.type, {
    processId: null,
    rootUri: null,
    capabilities: {}
  })

  const {uri} = await openTextDocument(connection, 'node16/non-existent.mdx')
  const result = await connection.sendRequest(PrepareRenameRequest.type, {
    position: {line: 7, character: 15},
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
  const result = await connection.sendRequest(PrepareRenameRequest.type, {
    position: {line: 7, character: 15},
    textDocument: {uri}
  })

  assert.deepEqual(result, null)
})
