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

test('ignore completion in markdown content', async () => {
  const {uri} = await serverHandle.openTextDocument(
    fixturePath('node16/completion.mdx'),
    'mdx'
  )
  const result = await serverHandle.sendCompletionRequest(uri, {
    line: 8,
    character: 10
  })

  assert.deepEqual(result, {isIncomplete: false, items: []})
})
