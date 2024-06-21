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
    typescript: {enabled: true, tsdk}
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

test('type errors', async () => {
  const {uri} = await serverHandle.openTextDocument(
    fixturePath('node16/type-errors.mdx'),
    'mdx'
  )
  const diagnostics = await serverHandle.sendDocumentDiagnosticRequest(uri)

  assert.deepEqual(diagnostics, {
    kind: 'full',
    items: [
      {
        code: 2568,
        data: {
          documentUri: String(
            URI.from({
              scheme: 'volar-embedded-content',
              authority: 'jsx',
              path:
                '/' + encodeURIComponent(fixtureUri('node16/type-errors.mdx'))
            })
          ),
          isFormat: false,
          original: {},
          pluginIndex: 2,
          uri: fixtureUri('node16/type-errors.mdx'),
          version: 0
        },
        message:
          "Property 'counter' may not exist on type '{ readonly count: number; readonly components?: {}; }'. Did you mean 'count'?",
        range: {
          start: {line: 14, character: 51},
          end: {line: 14, character: 58}
        },
        severity: 4,
        source: 'ts'
      },
      {
        code: 2568,
        data: {
          documentUri: String(
            URI.from({
              scheme: 'volar-embedded-content',
              authority: 'jsx',
              path:
                '/' + encodeURIComponent(fixtureUri('node16/type-errors.mdx'))
            })
          ),
          isFormat: false,
          original: {},
          pluginIndex: 2,
          uri: fixtureUri('node16/type-errors.mdx'),
          version: 0
        },
        message:
          "Property 'counts' may not exist on type 'Props'. Did you mean 'count'?",
        range: {
          start: {line: 6, character: 15},
          end: {line: 6, character: 21}
        },
        relatedInformation: [
          {
            location: {
              range: {
                end: {line: 12, character: 2},
                start: {line: 11, character: 4}
              },
              uri: fixtureUri('node16/type-errors.mdx')
            },
            message: "'count' is declared here."
          }
        ],
        severity: 4,
        source: 'ts'
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

test('provided components', async () => {
  const {uri} = await serverHandle.openTextDocument(
    fixturePath('provide/solar-system.mdx'),
    'mdx'
  )
  const diagnostics = await serverHandle.sendDocumentDiagnosticRequest(uri)

  assert.deepEqual(diagnostics, {
    items: [
      {
        code: 2741,
        data: {
          documentUri: String(
            URI.from({
              scheme: 'volar-embedded-content',
              authority: 'jsx',
              path:
                '/' + encodeURIComponent(fixtureUri('provide/solar-system.mdx'))
            })
          ),
          isFormat: false,
          original: {},
          pluginIndex: 2,
          uri: fixtureUri('provide/solar-system.mdx'),
          version: 0
        },
        message:
          "Property 'distanceFromStar' is missing in type '{ name: string; radius: number; }' but required in type 'PlanetProps'.",
        range: {
          end: {character: 7, line: 2},
          start: {character: 1, line: 2}
        },
        relatedInformation: [
          {
            location: {
              range: {
                end: {character: 18, line: 3},
                start: {character: 2, line: 3}
              },
              uri: fixtureUri('provide/components.tsx')
            },
            message: "'distanceFromStar' is declared here."
          }
        ],
        severity: 1,
        source: 'ts'
      }
    ],
    kind: 'full'
  })
})
