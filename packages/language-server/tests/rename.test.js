/**
 * @typedef {import('vscode-languageserver').ProtocolConnection} ProtocolConnection
 */
import assert from 'node:assert/strict'
import {afterEach, beforeEach, test} from 'node:test'
import {InitializeRequest, RenameRequest} from 'vscode-languageserver'
import {createConnection, fixtureUri, openTextDocument, tsdk} from './utils.js'

/** @type {ProtocolConnection} */
let connection

beforeEach(() => {
  connection = createConnection()
})

afterEach(() => {
  connection.dispose()
})

test('handle rename request of variable for opened references', async () => {
  await connection.sendRequest(InitializeRequest.type, {
    processId: null,
    rootUri: fixtureUri('node16'),
    capabilities: {},
    initializationOptions: {typescript: {tsdk}}
  })

  await openTextDocument(connection, 'node16/b.mdx')
  const {uri} = await openTextDocument(connection, 'node16/a.mdx')
  const result = await connection.sendRequest(RenameRequest.type, {
    newName: 'renamed',
    position: {line: 4, character: 3},
    textDocument: {uri}
  })

  assert.deepEqual(result, {
    changes: {
      [fixtureUri('node16/a.mdx')]: [
        {
          newText: 'renamed',
          range: {
            start: {line: 11, character: 1},
            end: {line: 11, character: 2}
          }
        },
        {
          newText: 'renamed',
          range: {
            start: {line: 4, character: 2},
            end: {line: 4, character: 3}
          }
        },
        {
          newText: 'renamed',
          range: {
            start: {line: 1, character: 16},
            end: {line: 1, character: 17}
          }
        }
      ],
      [fixtureUri('node16/b.mdx')]: [
        {
          newText: 'renamed',
          range: {
            start: {line: 0, character: 9},
            end: {line: 0, character: 10}
          }
        }
      ],
      [fixtureUri('node16/mixed.mdx')]: [
        {
          newText: 'renamed',
          range: {
            start: {line: 0, character: 9},
            end: {line: 0, character: 10}
          }
        }
      ]
    }
  })
})

test('handle undefined rename request', async () => {
  await connection.sendRequest(InitializeRequest.type, {
    processId: null,
    rootUri: fixtureUri('node16'),
    capabilities: {},
    initializationOptions: {typescript: {tsdk}}
  })

  const {uri} = await openTextDocument(connection, 'node16/undefined-props.mdx')
  const result = await connection.sendRequest(RenameRequest.type, {
    newName: 'renamed',
    position: {line: 4, character: 3},
    textDocument: {uri}
  })

  assert.deepEqual(result, null)
})

test('ignore non-existent mdx files', async () => {
  await connection.sendRequest(InitializeRequest.type, {
    processId: null,
    rootUri: fixtureUri('node16'),
    capabilities: {},
    initializationOptions: {typescript: {tsdk}}
  })

  const uri = fixtureUri('node16/non-existent.mdx')
  const result = await connection.sendRequest(RenameRequest.type, {
    newName: 'renamed',
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
  const result = await connection.sendRequest(RenameRequest.type, {
    newName: 'renamed',
    position: {line: 9, character: 15},
    textDocument: {uri}
  })

  assert.deepEqual(result, null)
})
