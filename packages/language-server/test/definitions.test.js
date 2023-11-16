/**
 * @typedef {import('@volar/language-server').ProtocolConnection} ProtocolConnection
 */
import assert from 'node:assert/strict'
import {afterEach, beforeEach, test} from 'node:test'
import {DefinitionRequest, InitializeRequest} from '@volar/language-server'
import {createConnection, fixtureUri, openTextDocument, tsdk} from './utils.js'

/** @type {ProtocolConnection} */
let connection

beforeEach(() => {
  connection = createConnection()
})

afterEach(() => {
  connection.dispose()
})

test('resolve file-local definitions in ESM', async () => {
  await connection.sendRequest(InitializeRequest.type, {
    processId: null,
    rootUri: fixtureUri('node16'),
    capabilities: {},
    initializationOptions: {typescript: {tsdk}}
  })

  const {uri} = await openTextDocument(connection, 'node16/a.mdx')
  const result = await connection.sendRequest(DefinitionRequest.type, {
    position: {line: 4, character: 3},
    textDocument: {uri}
  })

  assert.deepEqual(result, [
    {
      originSelectionRange: {
        start: {line: 4, character: 2},
        end: {line: 4, character: 3}
      },
      targetRange: {
        start: {line: 1, character: 0},
        end: {line: 1, character: 22}
      },
      targetSelectionRange: {
        start: {line: 1, character: 16},
        end: {line: 1, character: 17}
      },
      targetUri: fixtureUri('node16/a.mdx')
    }
  ])
})

test('resolve cross-file definitions in ESM if the other file was previously opened', async () => {
  await connection.sendRequest(InitializeRequest.type, {
    processId: null,
    rootUri: fixtureUri('node16'),
    capabilities: {},
    initializationOptions: {typescript: {tsdk}}
  })

  await openTextDocument(connection, 'node16/a.mdx')
  const {uri} = await openTextDocument(connection, 'node16/b.mdx')
  const result = await connection.sendRequest(DefinitionRequest.type, {
    position: {line: 0, character: 10},
    textDocument: {uri}
  })

  assert.deepEqual(result, [
    {
      originSelectionRange: {
        start: {line: 0, character: 9},
        end: {line: 0, character: 10}
      },
      targetRange: {
        start: {line: 1, character: 0},
        end: {line: 1, character: 22}
      },
      targetSelectionRange: {
        start: {line: 1, character: 16},
        end: {line: 1, character: 17}
      },
      targetUri: fixtureUri('node16/a.mdx')
    }
  ])
})

test('resolve cross-file definitions in ESM if the other file is unopened', async () => {
  await connection.sendRequest(InitializeRequest.type, {
    processId: null,
    rootUri: fixtureUri('node16'),
    capabilities: {},
    initializationOptions: {typescript: {tsdk}}
  })

  const {uri} = await openTextDocument(connection, 'node16/b.mdx')
  const result = await connection.sendRequest(DefinitionRequest.type, {
    position: {line: 0, character: 10},
    textDocument: {uri}
  })

  assert.deepEqual(result, [
    {
      originSelectionRange: {
        start: {line: 0, character: 9},
        end: {line: 0, character: 10}
      },
      targetRange: {
        start: {line: 1, character: 0},
        end: {line: 1, character: 22}
      },
      targetSelectionRange: {
        start: {line: 1, character: 16},
        end: {line: 1, character: 17}
      },
      targetUri: fixtureUri('node16/a.mdx')
    }
  ])
})

test('does not resolve shadow content', async () => {
  await connection.sendRequest(InitializeRequest.type, {
    processId: null,
    rootUri: fixtureUri('node16'),
    capabilities: {},
    initializationOptions: {typescript: {tsdk}}
  })

  const {uri} = await openTextDocument(connection, 'node16/undefined-props.mdx')
  const result = await connection.sendRequest(DefinitionRequest.type, {
    position: {line: 0, character: 37},
    textDocument: {uri}
  })

  assert.deepEqual(result, [])
})

test('ignore non-existent mdx files', async () => {
  await connection.sendRequest(InitializeRequest.type, {
    processId: null,
    rootUri: fixtureUri('node16'),
    capabilities: {},
    initializationOptions: {typescript: {tsdk}}
  })

  const uri = fixtureUri('node16/non-existent.mdx')
  const result = await connection.sendRequest(DefinitionRequest.type, {
    position: {line: 7, character: 15},
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
  const result = await connection.sendRequest(DefinitionRequest.type, {
    position: {line: 9, character: 15},
    textDocument: {uri}
  })

  assert.deepEqual(result, [])
})
