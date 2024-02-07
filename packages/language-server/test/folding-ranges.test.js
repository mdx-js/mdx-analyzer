/**
 * @typedef {import('@volar/test-utils').LanguageServerHandle} LanguageServerHandle
 */
import assert from 'node:assert/strict'
import {afterEach, beforeEach, test} from 'node:test'
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

test('resolve folding ranges', async () => {
  const {uri} = await serverHandle.openTextDocument(
    fixturePath('node16/mixed.mdx'),
    'mdx'
  )
  const result = await serverHandle.sendFoldingRangesRequest(uri)

  assert.deepEqual(result, [
    {
      endCharacter: 4,
      endLine: 4,
      kind: 'comment',
      startCharacter: 1,
      startLine: 2
    },
    {
      endCharacter: 10,
      endLine: 14,
      startCharacter: 43,
      startLine: 10
    },
    {
      endCharacter: 12,
      endLine: 12,
      startCharacter: 16,
      startLine: 11
    },
    {
      endCharacter: 0,
      endLine: 2,
      startCharacter: 0,
      startLine: 2
    },
    {
      endLine: 45,
      startLine: 6
    },
    {
      endLine: 31,
      startLine: 17
    },
    {
      endLine: 23,
      startLine: 21
    },
    {
      endLine: 31,
      startLine: 25
    },
    {
      endLine: 31,
      startLine: 29
    },
    {
      endLine: 42,
      startLine: 33
    },
    {
      endLine: 45,
      startLine: 43
    },
    {
      endLine: 39,
      startLine: 37
    },
    {
      endLine: 45,
      startLine: 41
    }
  ])
})

test('ignore non-existent mdx files', async () => {
  const uri = fixtureUri('node16/non-existent.mdx')
  const result = await serverHandle.sendFoldingRangesRequest(uri)

  assert.deepEqual(result, null)
})
