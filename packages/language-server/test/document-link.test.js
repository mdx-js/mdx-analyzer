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

test('resolve markdown link references', async () => {
  const {uri} = await serverHandle.openTextDocument(
    fixturePath('node16/link-reference.mdx'),
    'mdx'
  )
  const result = await serverHandle.sendDocumentLinkRequest(uri)

  assert.deepEqual(result, [
    {
      range: {
        start: {line: 0, character: 9},
        end: {line: 0, character: 12}
      },
      tooltip: 'Go to link definition',
      target: fixtureUri('node16/link-reference.mdx?virtualCodeId=md#L3,8'),
      data: {
        uri: fixtureUri('node16/link-reference.mdx'),
        original: {
          data: {
            kind: 1,
            source: {
              isAngleBracketLink: false,
              hrefText: 'mdx',
              pathText: 'mdx',
              resource: {
                $mid: 1,
                path: fixturePath('node16/link-reference.mdx'),
                query: 'virtualCodeId=md',
                scheme: 'file'
              },
              range: {
                start: {line: 0, character: 8},
                end: {line: 0, character: 15}
              },
              targetRange: {
                start: {line: 0, character: 9},
                end: {line: 0, character: 12}
              },
              hrefRange: {
                start: {line: 0, character: 9},
                end: {line: 0, character: 12}
              }
            },
            href: {kind: 2, ref: 'mdx'}
          }
        },
        serviceIndex: 0
      }
    },
    {
      range: {start: {line: 2, character: 7}, end: {line: 2, character: 24}},
      target: 'https://mdxjs.com/',
      data: {
        uri: fixtureUri('node16/link-reference.mdx'),
        original: {},
        serviceIndex: 0
      }
    }
  ])
})
