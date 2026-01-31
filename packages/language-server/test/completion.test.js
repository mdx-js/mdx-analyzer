/**
 * @fileoverview Language server completion tests
 *
 * Note: TypeScript-specific completion tests have been moved to TypeScript
 * plugin testing. This file only tests language server specific functionality
 * that doesn't depend on full TypeScript support.
 *
 * @import {LanguageServerHandle} from '@volar/test-utils'
 */
import assert from 'node:assert/strict'
import {afterEach, beforeEach, test} from 'node:test'
import {createServer, fixturePath, fixtureUri} from './utils.js'

/** @type {LanguageServerHandle} */
let serverHandle

beforeEach(async () => {
  serverHandle = createServer()
  await serverHandle.initialize(fixtureUri('node16'), {})
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

test('ignore non-existent mdx files', async () => {
  const uri = fixtureUri('node16/non-existent.mdx')
  const result = await serverHandle.sendCompletionRequest(uri, {
    line: 1,
    character: 1
  })

  assert.deepEqual(result, {isIncomplete: false, items: []})
})
