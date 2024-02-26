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
  // @ts-expect-error https://github.com/volarjs/volar.js/pull/142
  await serverHandle.initialize(fixtureUri('node16'), {typescript: {tsdk}})
})

afterEach(() => {
  serverHandle.connection.dispose()
})

test('handle prepare rename request of variable', async () => {
  const {uri} = await serverHandle.openTextDocument(
    fixturePath('node16/a.mdx'),
    'mdx'
  )
  const result = await serverHandle.sendPrepareRenameRequest(uri, {
    line: 4,
    character: 3
  })

  assert.deepEqual(result, {
    start: {line: 4, character: 2},
    end: {line: 4, character: 3}
  })
})

test('ignore non-existent mdx files', async () => {
  const uri = fixtureUri('node16/non-existent.mdx')
  const result = await serverHandle.sendPrepareRenameRequest(uri, {
    line: 4,
    character: 3
  })

  assert.deepEqual(result, null)
})
