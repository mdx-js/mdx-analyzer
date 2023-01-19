/**
 * @typedef {import('vscode-languageserver').ProtocolConnection} ProtocolConnection
 */
import assert from 'node:assert/strict'
import {afterEach, beforeEach, test} from 'node:test'

import {DefinitionRequest, InitializeRequest} from 'vscode-languageserver'

import {createConnection, fixtureUri, openTextDocument} from './utils.js'

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
    rootUri: null,
    capabilities: {}
  })

  const {uri} = await openTextDocument(connection, 'node16/a.mdx')
  const result = await connection.sendRequest(DefinitionRequest.type, {
    position: {line: 4, character: 3},
    textDocument: {uri}
  })

  assert.deepEqual(result, [
    {
      targetRange: {
        start: {line: 1, character: 16},
        end: {line: 1, character: 17}
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
    rootUri: null,
    capabilities: {}
  })

  await openTextDocument(connection, 'node16/a.mdx')
  const {uri} = await openTextDocument(connection, 'node16/b.mdx')
  const result = await connection.sendRequest(DefinitionRequest.type, {
    position: {line: 0, character: 10},
    textDocument: {uri}
  })

  assert.deepEqual(result, [
    {
      targetRange: {
        start: {line: 1, character: 16},
        end: {line: 1, character: 17}
      },
      targetSelectionRange: {
        start: {line: 1, character: 16},
        end: {line: 1, character: 17}
      },
      targetUri: fixtureUri('node16/a.mdx')
    }
  ])
})

test(
  'resolve cross-file definitions in ESM if the other file is unopened',
  {skip: true},
  async () => {
    await connection.sendRequest(InitializeRequest.type, {
      processId: null,
      rootUri: null,
      capabilities: {}
    })

    const {uri} = await openTextDocument(connection, 'node16/b.mdx')
    const result = await connection.sendRequest(DefinitionRequest.type, {
      position: {line: 0, character: 10},
      textDocument: {uri}
    })

    assert.deepEqual(result, [
      {
        targetRange: {
          start: {line: 1, character: 16},
          end: {line: 1, character: 17}
        },
        targetSelectionRange: {
          start: {line: 1, character: 16},
          end: {line: 1, character: 17}
        },
        targetUri: fixtureUri('node16/a.mdx')
      }
    ])
  }
)

test('resolve markdown link references', async () => {
  await connection.sendRequest(InitializeRequest.type, {
    processId: null,
    rootUri: null,
    capabilities: {}
  })

  const {uri} = await openTextDocument(connection, 'node16/link-reference.mdx')
  const result = await connection.sendRequest(DefinitionRequest.type, {
    position: {line: 0, character: 10},
    textDocument: {uri}
  })

  assert.deepEqual(result, [
    {
      targetRange: {
        start: {line: 2, character: 0},
        end: {line: 2, character: 24}
      },
      targetSelectionRange: {
        start: {line: 2, character: 0},
        end: {line: 2, character: 24}
      },
      targetUri: fixtureUri('node16/link-reference.mdx')
    }
  ])
})

test('ignore non-existent mdx files', async () => {
  await connection.sendRequest(InitializeRequest.type, {
    processId: null,
    rootUri: null,
    capabilities: {}
  })

  const {uri} = await openTextDocument(connection, 'node16/non-existent.mdx')
  const result = await connection.sendRequest(DefinitionRequest.type, {
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
  const result = await connection.sendRequest(DefinitionRequest.type, {
    position: {line: 9, character: 15},
    textDocument: {uri}
  })

  assert.deepEqual(result, null)
})
