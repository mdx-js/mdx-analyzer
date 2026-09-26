/**
 * @import {LanguageServerHandle} from '@volar/test-utils'
 */
import assert from 'node:assert/strict'
import {afterEach, beforeEach, test} from 'node:test'
import {createServer, fixturePath, fixtureUri, tsdk} from './utils.js'

/** @type {LanguageServerHandle} */
let serverHandle

beforeEach(async () => {
  serverHandle = createServer()
  await serverHandle.initialize(fixtureUri('node16'), {
    typescript: {tsdk}
  })
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
