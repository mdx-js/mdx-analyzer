/**
 * @import {LanguageServerHandle} from '@volar/test-utils'
 */
import assert from 'node:assert/strict'
import {afterEach, beforeEach, test} from 'node:test'
import {URI} from 'vscode-uri'
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
        code: 'micromark-extension-mdxjs-esm:non-esm',
        codeDescription: {
          href: 'https://github.com/micromark/micromark-extension-mdxjs-esm#unexpected-type-in-code-only-importexports-are-supported'
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
        message:
          'Unexpected `ExpressionStatement` in code: only import/exports are supported',
        range: {
          end: {
            character: 10,
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
