/**
 * @fileoverview Language server code action tests
 *
 * Note: TypeScript-specific code action tests (like organize imports) have been
 * moved to TypeScript plugin testing. This file only tests language server
 * specific functionality that doesn't depend on full TypeScript support.
 *
 * @import {LanguageServerHandle} from '@volar/test-utils'
 */
import assert from 'node:assert/strict'
import {afterEach, beforeEach, test} from 'node:test'
import {CodeActionTriggerKind} from '@volar/language-server'
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

test('return empty code actions for non-existent file', async () => {
  const uri = fixtureUri('node16/non-existent.mdx')

  const codeActions = await serverHandle.sendCodeActionsRequest(
    uri,
    {
      start: {line: 0, character: 0},
      end: {line: 0, character: 0}
    },
    {
      diagnostics: [],
      only: ['source.organizeImports'],
      triggerKind: CodeActionTriggerKind.Invoked
    }
  )

  assert.deepEqual(codeActions, [])
})
