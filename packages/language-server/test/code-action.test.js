/**
 * @import {LanguageServerHandle} from '@volar/test-utils'
 */
import assert from 'node:assert/strict'
import {afterEach, beforeEach, test} from 'node:test'
import {CodeAction, CodeActionTriggerKind} from '@volar/language-server'
import {createServer, fixturePath, fixtureUri, tsdk} from './utils.js'

/** @type {LanguageServerHandle} */
let serverHandle

beforeEach(async () => {
  serverHandle = createServer()
  await serverHandle.initialize(fixtureUri('node16'), {
    typescript: {enabled: true, tsdk}
  })
})

afterEach(() => {
  serverHandle.connection.dispose()
})

test('organize imports', async () => {
  const {uri} = await serverHandle.openTextDocument(
    fixturePath('node16/organize-imports.mdx'),
    'mdx'
  )

  const codeActions = await serverHandle.sendCodeActionsRequest(
    uri,
    {
      start: {line: 6, character: 0},
      end: {line: 6, character: 0}
    },
    {
      diagnostics: [],
      only: ['source.organizeImports'],
      triggerKind: CodeActionTriggerKind.Invoked
    }
  )

  assert.ok(codeActions)
  const codeAction = codeActions
    .filter((c) => CodeAction.is(c))
    .find((c) => c.kind === 'source.organizeImports')

  assert.partialDeepStrictEqual(codeAction, {
    data: {},
    diagnostics: [],
    edit: {
      documentChanges: [
        {
          edits: [
            {
              newText:
                "import { compile } from '@mdx-js/mdx';\n" +
                "import { useState } from 'react';\n" +
                "import { createRoot } from 'react-dom/client';\n" +
                "import { unified } from 'unified';\n",
              range: {
                end: {character: 0, line: 5},
                start: {character: 0, line: 4}
              }
            },
            {
              newText: '',
              range: {
                end: {character: 0, line: 6},
                start: {character: 0, line: 5}
              }
            },
            {
              newText: '',
              range: {
                end: {character: 0, line: 7},
                start: {character: 0, line: 6}
              }
            },
            {
              newText: '',
              range: {
                end: {character: 0, line: 8},
                start: {character: 0, line: 7}
              }
            }
          ],
          textDocument: {
            uri: fixtureUri('node16/organize-imports.mdx'),
            version: null
          }
        }
      ]
    },
    kind: 'source.organizeImports',
    title: 'Organize Imports'
  })
})
