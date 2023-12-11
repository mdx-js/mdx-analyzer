/**
 * @typedef {import('@volar/test-utils').LanguageServerHandle} LanguageServerHandle
 */
import assert from 'node:assert/strict'
import {afterEach, beforeEach, test} from 'node:test'
import {SymbolKind} from '@volar/language-server'
import {createServer, fixturePath, fixtureUri, tsdk} from './utils.js'

/** @type {LanguageServerHandle} */
let serverHandle

beforeEach(async () => {
  serverHandle = createServer()
  await serverHandle.initialize(fixtureUri('node16'), {typescript: {tsdk}})
})

afterEach(() => {
  serverHandle.connection.dispose()
})

test('resolve document symbols', async () => {
  const {uri} = await serverHandle.openTextDocument(
    fixturePath('node16/mixed.mdx'),
    'mdx'
  )
  const result = await serverHandle.sendDocumentSymbolRequest(uri)

  assert.deepEqual(result, [
    {
      children: [],
      kind: SymbolKind.Function,
      name: 'exportedFunction',
      range: {
        end: {line: 15, character: 1},
        start: {line: 10, character: 0}
      },
      selectionRange: {
        end: {line: 10, character: 32},
        start: {line: 10, character: 16}
      }
    }
  ])
})

test('ignore non-existent mdx files', async () => {
  const uri = fixtureUri('node16/non-existent.mdx')
  const result = await serverHandle.sendDocumentSymbolRequest(uri)

  assert.deepEqual(result, null)
})
