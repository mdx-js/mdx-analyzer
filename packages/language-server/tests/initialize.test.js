/**
 * @typedef {import('vscode-languageserver-protocol').ProtocolConnection} ProtocolConnection
 */
import assert from 'node:assert/strict'
import {afterEach, beforeEach, test} from 'node:test'
import {InitializeRequest} from 'vscode-languageserver-protocol'
import {createConnection} from './utils.js'

/** @type {ProtocolConnection} */
let connection

beforeEach(() => {
  connection = createConnection()
})

afterEach(() => {
  connection.dispose()
})

test('initialize', async () => {
  const initializeResponse = await connection.sendRequest(
    InitializeRequest.type,
    {
      processId: null,
      rootUri: null,
      capabilities: {}
    }
  )
  assert.deepEqual(initializeResponse, {
    capabilities: {
      completionProvider: {
        completionItem: {labelDetailsSupport: true},
        resolveProvider: true
      },
      definitionProvider: true,
      documentSymbolProvider: {label: 'MDX'},
      foldingRangeProvider: true,
      hoverProvider: true,
      referencesProvider: true,
      renameProvider: {prepareProvider: true},
      textDocumentSync: 1,
      typeDefinitionProvider: true
    }
  })
})
