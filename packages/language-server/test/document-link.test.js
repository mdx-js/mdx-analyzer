/**
 * @typedef {import('vscode-languageserver').ProtocolConnection} ProtocolConnection
 */
import assert from 'node:assert/strict'
import process from 'node:process'
import {afterEach, beforeEach, test} from 'node:test'
import {DocumentLinkRequest, InitializeRequest} from 'vscode-languageserver'
import {
  createConnection,
  fixturePath,
  fixtureUri,
  openTextDocument,
  tsdk
} from './utils.js'

/** @type {ProtocolConnection} */
let connection

beforeEach(() => {
  connection = createConnection()
})

afterEach(() => {
  connection.dispose()
})

test('resolve markdown link references', async () => {
  await connection.sendRequest(InitializeRequest.type, {
    processId: null,
    rootUri: fixtureUri('node16'),
    capabilities: {},
    initializationOptions: {typescript: {tsdk}}
  })

  const {uri} = await openTextDocument(connection, 'node16/link-reference.mdx')
  const result = await connection.sendRequest(DocumentLinkRequest.type, {
    textDocument: {uri}
  })

  const linkReferencePath = fixturePath('node16/link-reference.mdx.md')

  assert.deepEqual(result, [
    {
      range: {
        start: {line: 0, character: 9},
        end: {line: 0, character: 12}
      },
      tooltip: 'Go to link definition',
      // This is caused by an upstream bug in Volar
      // target: fixtureUri('node16/link-reference.mdx') + '#L3,8',
      target: fixtureUri('node16/link-reference.mdx') + '#L3,8',
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
                path:
                  process.platform === 'win32'
                    ? '/' + linkReferencePath
                    : linkReferencePath,
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
        serviceId: 'markdown'
      }
    },
    {
      range: {start: {line: 2, character: 7}, end: {line: 2, character: 24}},
      target: 'https://mdxjs.com/',
      data: {
        uri: fixtureUri('node16/link-reference.mdx'),
        original: {},
        serviceId: 'markdown'
      }
    }
  ])
})
