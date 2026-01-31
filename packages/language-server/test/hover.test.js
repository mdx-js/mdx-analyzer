/**
 * @fileoverview Language server hover tests
 *
 * Note: TypeScript-specific hover tests have been moved to TypeScript plugin
 * testing. This file only tests language server specific functionality that
 * doesn't depend on full TypeScript support.
 *
 * @import {LanguageServerHandle} from '@volar/test-utils'
 */
import assert from 'node:assert/strict'
import {afterEach, beforeEach, test} from 'node:test'
import {createServer, fixtureUri} from './utils.js'

/** @type {LanguageServerHandle} */
let serverHandle

beforeEach(async () => {
  serverHandle = createServer()
  await serverHandle.initialize(fixtureUri('node16'), {})
})

afterEach(() => {
  serverHandle.connection.dispose()
})

test('ignore non-existent mdx files', async () => {
  const uri = fixtureUri('node16/non-existent.mdx')
  const result = await serverHandle.sendHoverRequest(uri, {
    line: 7,
    character: 15
  })

  assert.deepEqual(result, null)
})
