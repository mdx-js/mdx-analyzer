/**
 * @import {LanguageServerHandle} from '@volar/test-utils'
 */
import assert from 'node:assert/strict'
import {afterEach, beforeEach, test} from 'node:test'
import {SymbolKind} from '@volar/language-server'
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

test('resolve document symbols', async () => {
  const {uri} = await serverHandle.openTextDocument(
    fixturePath('node16/mixed.mdx'),
    'mdx'
  )
  const result = await serverHandle.sendDocumentSymbolRequest(uri)

  assert.deepEqual(result, [
    {
      name: '# Mixed content',
      kind: SymbolKind.String,
      range: {
        start: {line: 6, character: 0},
        end: {line: 46, character: 0}
      },
      selectionRange: {
        start: {line: 6, character: 0},
        end: {line: 46, character: 0}
      },
      children: [
        {
          name: '## Level 2 Header',
          kind: SymbolKind.String,
          range: {
            start: {line: 17, character: 0},
            end: {line: 32, character: 0}
          },
          selectionRange: {
            start: {line: 17, character: 0},
            end: {line: 32, character: 0}
          },
          children: [
            {
              name: '### Level 3 Header',
              kind: SymbolKind.String,
              range: {
                start: {line: 21, character: 0},
                end: {line: 24, character: 0}
              },
              selectionRange: {
                start: {line: 21, character: 0},
                end: {line: 24, character: 0}
              },
              children: []
            },
            {
              name: '### Another Kevel 3 Header',
              kind: SymbolKind.String,
              range: {
                start: {line: 25, character: 0},
                end: {line: 32, character: 0}
              },
              selectionRange: {
                start: {line: 25, character: 0},
                end: {line: 32, character: 0}
              },
              children: [
                {
                  name: '###### Level 6 Heading',
                  kind: SymbolKind.String,
                  range: {
                    start: {line: 29, character: 0},
                    end: {line: 32, character: 0}
                  },
                  selectionRange: {
                    start: {line: 29, character: 0},
                    end: {line: 32, character: 0}
                  },
                  children: []
                }
              ]
            }
          ]
        },
        {
          name: '## Another Level 2 Header',
          kind: SymbolKind.String,
          range: {
            start: {line: 33, character: 0},
            end: {line: 42, character: 1}
          },
          selectionRange: {
            start: {line: 33, character: 0},
            end: {line: 42, character: 1}
          },
          children: []
        },
        {
          name: '## Heading inside a block quote',
          kind: SymbolKind.String,
          range: {
            start: {line: 43, character: 0},
            end: {line: 46, character: 0}
          },
          selectionRange: {
            start: {line: 43, character: 0},
            end: {line: 46, character: 0}
          },
          children: []
        },
        {
          name: 'exportedFunction',
          kind: SymbolKind.Function,
          range: {
            start: {line: 10, character: 0},
            end: {line: 15, character: 1}
          },
          selectionRange: {
            start: {line: 10, character: 16},
            end: {line: 10, character: 32}
          },
          children: []
        }
      ]
    }
  ])
})

test('ignore non-existent mdx files', async () => {
  const uri = fixtureUri('node16/non-existent.mdx')
  const result = await serverHandle.sendDocumentSymbolRequest(uri)

  assert.deepEqual(result, null)
})
