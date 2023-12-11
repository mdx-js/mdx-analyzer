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
  await serverHandle.initialize(fixtureUri('node16'), {typescript: {tsdk}})
})

afterEach(() => {
  serverHandle.connection.dispose()
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
          documentUri: fixtureUri('node16/type-errors.mdx.jsx'),
          isFormat: false,
          original: {},
          serviceIndex: 1,
          uri: fixtureUri('node16/type-errors.mdx'),
          version: 1
        },
        message:
          "Property 'counter' may not exist on type 'Props'. Did you mean 'count'?",
        range: {
          start: {line: 14, character: 51},
          end: {line: 14, character: 58}
        },
        relatedInformation: [
          {
            location: {
              range: {
                start: {line: 11, character: 4},
                end: {line: 12, character: 2}
              },
              uri: fixtureUri('node16/type-errors.mdx')
            },
            message: "'count' is declared here."
          }
        ],
        severity: 4,
        source: 'ts'
      },
      {
        code: 2568,
        data: {
          documentUri: fixtureUri('node16/type-errors.mdx.jsx'),
          isFormat: false,
          original: {},
          serviceIndex: 1,
          uri: fixtureUri('node16/type-errors.mdx'),
          version: 1
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
