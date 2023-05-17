/**
 * @typedef {import('vscode-languageserver').ProtocolConnection} ProtocolConnection
 */
import assert from 'node:assert/strict'
import {afterEach, beforeEach, test} from 'node:test'
import {HoverRequest, InitializeRequest} from 'vscode-languageserver'
import {createConnection, fixtureUri, openTextDocument} from './utils.js'

/** @type {ProtocolConnection} */
let connection

beforeEach(() => {
  connection = createConnection()
})

afterEach(() => {
  connection.dispose()
})

test('resolve hover in ESM', async () => {
  await connection.sendRequest(InitializeRequest.type, {
    processId: null,
    rootUri: null,
    capabilities: {}
  })

  const {uri} = await openTextDocument(connection, 'node16/a.mdx')
  const result = await connection.sendRequest(HoverRequest.type, {
    position: {line: 4, character: 3},
    textDocument: {uri}
  })

  assert.deepEqual(result, {
    contents: {
      kind: 'markdown',
      value: '```typescript\nfunction a(): void\n```\nDescription of `a`'
    },
    range: {
      end: {line: 4, character: 3},
      start: {line: 4, character: 2}
    }
  })
})

test('resolve import hover in ESM if the other file was previously opened', async () => {
  await connection.sendRequest(InitializeRequest.type, {
    processId: null,
    rootUri: null,
    capabilities: {}
  })

  await openTextDocument(connection, 'node16/a.mdx')
  const {uri} = await openTextDocument(connection, 'node16/b.mdx')
  const result = await connection.sendRequest(HoverRequest.type, {
    position: {line: 0, character: 10},
    textDocument: {uri}
  })

  assert.deepEqual(result, {
    contents: {
      kind: 'markdown',
      value:
        '```typescript\n(alias) function a(): void\nimport a\n```\nDescription of `a`'
    },
    range: {
      start: {line: 0, character: 9},
      end: {line: 0, character: 10}
    }
  })
})

test('resolve import hover in ESM if the other file is unopened', async () => {
  await connection.sendRequest(InitializeRequest.type, {
    processId: null,
    rootUri: null,
    capabilities: {}
  })

  const {uri} = await openTextDocument(connection, 'node16/b.mdx')
  const result = await connection.sendRequest(HoverRequest.type, {
    position: {line: 0, character: 10},
    textDocument: {uri}
  })

  assert.deepEqual(result, {
    contents: {
      kind: 'markdown',
      value:
        '```typescript\n(alias) function a(): void\nimport a\n```\nDescription of `a`'
    },
    range: {
      start: {line: 0, character: 9},
      end: {line: 0, character: 10}
    }
  })
})

test('resolve import hover in JSX expressions', async () => {
  await connection.sendRequest(InitializeRequest.type, {
    processId: null,
    rootUri: null,
    capabilities: {}
  })

  const {uri} = await openTextDocument(connection, 'node16/a.mdx')
  const result = await connection.sendRequest(HoverRequest.type, {
    position: {line: 11, character: 1},
    textDocument: {uri}
  })

  assert.deepEqual(result, {
    contents: {
      kind: 'markdown',
      value: '```typescript\nfunction a(): void\n```\nDescription of `a`'
    },
    range: {
      start: {line: 11, character: 1},
      end: {line: 11, character: 2}
    }
  })
})

test('support mdxJsxTextElement', async () => {
  await connection.sendRequest(InitializeRequest.type, {
    processId: null,
    rootUri: null,
    capabilities: {}
  })

  const {uri} = await openTextDocument(
    connection,
    'node16/mdx-jsx-text-element.mdx'
  )
  const result = await connection.sendRequest(HoverRequest.type, {
    position: {line: 3, character: 5},
    textDocument: {uri}
  })

  assert.deepEqual(result, {
    contents: {
      kind: 'markdown',
      value:
        '```typescript\nfunction Component(): void\n```\nDescription of `Component`'
    },
    range: {
      start: {line: 3, character: 1},
      end: {line: 3, character: 10}
    }
  })
})

test('resolve import hover in JSX elements', async () => {
  await connection.sendRequest(InitializeRequest.type, {
    processId: null,
    rootUri: null,
    capabilities: {}
  })

  const {uri} = await openTextDocument(connection, 'node16/a.mdx')
  const result = await connection.sendRequest(HoverRequest.type, {
    position: {line: 13, character: 5},
    textDocument: {uri}
  })

  assert.deepEqual(result, {
    contents: {
      kind: 'markdown',
      value: '```typescript\nfunction Component(): JSX.Element\n```\n'
    },
    range: {
      start: {line: 13, character: 1},
      end: {line: 13, character: 10}
    }
  })
})

test('ignore non-existent mdx files', async () => {
  await connection.sendRequest(InitializeRequest.type, {
    processId: null,
    rootUri: null,
    capabilities: {}
  })

  const uri = fixtureUri('node16/non-existent.mdx')
  const result = await connection.sendRequest(HoverRequest.type, {
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
  const result = await connection.sendRequest(HoverRequest.type, {
    position: {line: 9, character: 15},
    textDocument: {uri}
  })

  assert.deepEqual(result, null)
})
