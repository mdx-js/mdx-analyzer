/**
 * @fileoverview Rename tests
 *
 * Note: TypeScript-specific rename functionality (like variable renaming) is
 * now provided by the TypeScript plugin. This file only tests language server
 * specific functionality.
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

test('handle undefined rename request', async () => {
  const {uri} = await serverHandle.openTextDocument(
    fixturePath('node16/undefined-props.mdx'),
    'mdx'
  )
  const result = await serverHandle.sendRenameRequest(
    uri,
    {line: 4, character: 3},
    'renamed'
  )

  assert.deepEqual(result, null)
})

test('ignore non-existent mdx files', async () => {
  const uri = fixtureUri('node16/non-existent.mdx')
  const result = await serverHandle.sendRenameRequest(
    uri,
    {line: 7, character: 15},
    'renamed'
  )

  assert.deepEqual(result, null)
})
