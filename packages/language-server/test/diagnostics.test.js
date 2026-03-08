/**
 * @fileoverview Language server diagnostics tests
 *
 * Note: TypeScript-specific type error diagnostics are tested through the
 * TypeScript plugin. This file only tests MDX syntax error diagnostics that
 * don't depend on full TypeScript support.
 *
 * @import {LanguageServerHandle} from '@volar/test-utils'
 */
import assert from 'node:assert/strict'
import {afterEach, beforeEach, test} from 'node:test'
import {URI} from 'vscode-uri'
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

test('parse errors', async () => {
  const {uri} = await serverHandle.openTextDocument(
    fixturePath('node16/syntax-error.mdx'),
    'mdx'
  )
  const diagnostics = await serverHandle.sendDocumentDiagnosticRequest(uri)
  assert.deepEqual(diagnostics, {
    kind: 'full',
    items: [
      {
        code: 'micromark-extension-mdxjs-esm:acorn',
        codeDescription: {
          href: 'https://github.com/micromark/micromark-extension-mdxjs-esm#could-not-parse-importexports-with-acorn'
        },
        data: {
          documentUri: String(
            URI.from({
              scheme: 'volar-embedded-content',
              authority: 'mdx',
              path:
                '/' + encodeURIComponent(fixtureUri('node16/syntax-error.mdx'))
            })
          ),
          isFormat: false,
          original: {},
          pluginIndex: 1,
          uri: fixtureUri('node16/syntax-error.mdx'),
          version: 0
        },
        message: 'Could not parse import/exports with acorn',
        range: {
          end: {
            character: 7,
            line: 0
          },
          start: {
            character: 7,
            line: 0
          }
        },
        severity: 1,
        source: 'MDX'
      }
    ]
  })
})

test('does not resolve shadow content', async () => {
  const {uri} = await serverHandle.openTextDocument(
    fixturePath('node16/link-reference.mdx'),
    'mdx'
  )
  const diagnostics = await serverHandle.sendDocumentDiagnosticRequest(uri)
  assert.deepEqual(diagnostics, {
    items: [],
    kind: 'full'
  })
})
