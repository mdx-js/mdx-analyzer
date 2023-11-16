/**
 * @typedef {import('@volar/language-server').ProtocolConnection} ProtocolConnection
 */
import assert from 'node:assert/strict'
import {afterEach, beforeEach, test} from 'node:test'
import {
  CompletionItemKind,
  CompletionRequest,
  CompletionResolveRequest,
  InitializeRequest,
  InsertTextFormat
} from '@volar/language-server'
import {
  createConnection,
  fixturePath,
  fixtureUri,
  openTextDocument,
  tsdk
} from './utils.js'

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
    rootUri: fixtureUri('node16'),
    capabilities: {},
    initializationOptions: {typescript: {tsdk}}
  })

  const {uri} = await openTextDocument(connection, 'node16/completion.mdx')
  const result = await connection.sendRequest(CompletionRequest.type, {
    position: {line: 1, character: 1},
    textDocument: {uri}
  })

  assert.ok(result)
  assert.ok('items' in result)
  const completion = result.items.find((r) => r.label === 'Boolean')
  assert.deepEqual(completion, {
    commitCharacters: ['.', ',', ';', '('],
    data: {
      original: {
        data: {
          fileName: fixturePath('node16/completion.mdx.jsx'),
          offset: 30,
          originalItem: {name: 'Boolean'},
          uri: fixtureUri('node16/completion.mdx.jsx')
        }
      },
      serviceId: 'typescript',
      uri: fixtureUri('node16/completion.mdx'),
      virtualDocumentUri: fixtureUri('node16/completion.mdx.jsx')
    },
    insertTextFormat: InsertTextFormat.PlainText,
    kind: CompletionItemKind.Variable,
    label: 'Boolean',
    sortText: '15'
  })

  const resolved = await connection.sendRequest(
    CompletionResolveRequest.type,
    completion
  )
  assert.deepEqual(resolved, {
    commitCharacters: ['.', ',', ';', '('],
    data: {
      fileName: fixturePath('node16/completion.mdx.jsx'),
      offset: 30,
      originalItem: {name: 'Boolean'},
      uri: fixtureUri('node16/completion.mdx.jsx')
    },
    detail: 'interface Boolean\nvar Boolean: BooleanConstructor',
    documentation: {kind: 'markdown', value: ''},
    insertTextFormat: 1,
    kind: 6,
    label: 'Boolean',
    sortText: '15'
  })
})

test('support completion in JSX', async () => {
  await connection.sendRequest(InitializeRequest.type, {
    processId: null,
    rootUri: fixtureUri('node16'),
    capabilities: {},
    initializationOptions: {typescript: {tsdk}}
  })

  const {uri} = await openTextDocument(connection, 'node16/completion.mdx')
  const result = await connection.sendRequest(CompletionRequest.type, {
    position: {line: 5, character: 3},
    textDocument: {uri}
  })

  assert.ok(result)
  assert.ok('items' in result)
  const completion = result.items.find((r) => r.label === 'Boolean')
  assert.deepEqual(completion, {
    commitCharacters: ['.', ',', ';', '('],
    data: {
      original: {
        data: {
          fileName: fixturePath('node16/completion.mdx.jsx'),
          offset: 77,
          originalItem: {name: 'Boolean'},
          uri: fixtureUri('node16/completion.mdx.jsx')
        }
      },
      serviceId: 'typescript',
      uri: fixtureUri('node16/completion.mdx'),
      virtualDocumentUri: fixtureUri('node16/completion.mdx.jsx')
    },
    insertTextFormat: InsertTextFormat.PlainText,
    kind: CompletionItemKind.Variable,
    label: 'Boolean',
    sortText: '15'
  })

  const resolved = await connection.sendRequest(
    CompletionResolveRequest.type,
    completion
  )
  assert.deepEqual(resolved, {
    commitCharacters: ['.', ',', ';', '('],
    data: {
      fileName: fixturePath('node16/completion.mdx.jsx'),
      offset: 77,
      originalItem: {name: 'Boolean'},
      uri: fixtureUri('node16/completion.mdx.jsx')
    },
    detail: 'interface Boolean\nvar Boolean: BooleanConstructor',
    documentation: {kind: 'markdown', value: ''},
    insertTextFormat: 1,
    kind: 6,
    label: 'Boolean',
    sortText: '15'
  })
})

test('ignore completion in markdown content', async () => {
  await connection.sendRequest(InitializeRequest.type, {
    processId: null,
    rootUri: fixtureUri('node16'),
    capabilities: {},
    initializationOptions: {typescript: {tsdk}}
  })

  const {uri} = await openTextDocument(connection, 'node16/completion.mdx')
  const result = await connection.sendRequest(CompletionRequest.type, {
    position: {line: 8, character: 10},
    textDocument: {uri}
  })

  assert.deepEqual(result, {isIncomplete: false, items: []})
})
