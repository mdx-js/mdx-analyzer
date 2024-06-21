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
      target: String(
        URI.parse(fixtureUri('node16/link-reference.mdx')).with({
          fragment: 'L3,8'
        })
      ),
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
                authority: 'md',
                path:
                  '/' +
                  encodeURIComponent(fixtureUri('node16/link-reference.mdx')),
                scheme: 'volar-embedded-content'
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
        pluginIndex: 0
      }
    },
    {
      range: {start: {line: 2, character: 7}, end: {line: 2, character: 24}},
      target: 'https://mdxjs.com/',
      data: {
        uri: fixtureUri('node16/link-reference.mdx'),
        original: {},
        pluginIndex: 0
      }
    }
  ])
})
