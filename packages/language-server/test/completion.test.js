/**
 * @import {LanguageServerHandle} from '@volar/test-utils'
 */
import assert from 'node:assert/strict'
import {afterEach, beforeEach, test} from 'node:test'
import {CompletionItemKind, InsertTextFormat} from '@volar/language-server'
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

test('support completion in ESM', async () => {
  const {uri} = await serverHandle.openTextDocument(
    fixturePath('node16/completion.mdx'),
    'mdx'
  )

  const result = await serverHandle.sendCompletionRequest(uri, {
    line: 1,
    character: 1
  })
  assert.ok(result)
  assert.ok('items' in result)
  const completion = result.items.find((r) => r.label === 'Boolean')
  assert.deepEqual(completion, {
    commitCharacters: ['.', ',', ';', '('],
    data: {
      embeddedDocumentUri: String(
        URI.from({
          scheme: 'volar-embedded-content',
          authority: 'jsx',
          path: '/' + encodeURIComponent(fixtureUri('node16/completion.mdx'))
        })
      ),
      original: {
        data: {
          fileName: fixturePath('node16/completion.mdx'),
          offset: 81,
          originalItem: {name: 'Boolean'},
          uri: String(
            URI.from({
              scheme: 'volar-embedded-content',
              authority: 'jsx',
              path:
                '/' + encodeURIComponent(fixtureUri('node16/completion.mdx'))
            })
          )
        }
      },
      pluginIndex: 2,
      uri: fixtureUri('node16/completion.mdx')
    },
    insertTextFormat: InsertTextFormat.PlainText,
    kind: CompletionItemKind.Variable,
    label: 'Boolean',
    sortText: '15'
  })

  const resolved = await serverHandle.sendCompletionResolveRequest(completion)
  assert.deepEqual(resolved, {
    commitCharacters: ['.', ',', ';', '('],
    detail: 'interface Boolean\nvar Boolean: BooleanConstructor',
    documentation: {kind: 'markdown', value: ''},
    insertTextFormat: 1,
    kind: 6,
    label: 'Boolean',
    sortText: '15'
  })
})

test('support completion in JSX', async () => {
  const {uri} = await serverHandle.openTextDocument(
    fixturePath('node16/completion.mdx'),
    'mdx'
  )
  await serverHandle.sendCompletionRequest(uri, {
    line: 5,
    character: 3
  })
  const result = await serverHandle.sendCompletionRequest(uri, {
    line: 5,
    character: 3
  })

  assert.ok(result)
  assert.ok('items' in result)
  const completion = result.items.find((r) => r.label === 'Boolean')
  assert.deepEqual(completion, {
    commitCharacters: ['.', ',', ';', '('],
    data: {
      embeddedDocumentUri: String(
        URI.from({
          scheme: 'volar-embedded-content',
          authority: 'jsx',
          path: '/' + encodeURIComponent(fixtureUri('node16/completion.mdx'))
        })
      ),
      original: {
        data: {
          fileName: fixturePath('node16/completion.mdx'),
          offset: 119,
          originalItem: {name: 'Boolean'},
          uri: String(
            URI.from({
              scheme: 'volar-embedded-content',
              authority: 'jsx',
              path:
                '/' + encodeURIComponent(fixtureUri('node16/completion.mdx'))
            })
          )
        }
      },
      pluginIndex: 2,
      uri: fixtureUri('node16/completion.mdx')
    },
    insertTextFormat: InsertTextFormat.PlainText,
    kind: CompletionItemKind.Variable,
    label: 'Boolean',
    sortText: '15'
  })

  const resolved = await serverHandle.sendCompletionResolveRequest(completion)
  assert.deepEqual(resolved, {
    commitCharacters: ['.', ',', ';', '('],
    detail: 'interface Boolean\nvar Boolean: BooleanConstructor',
    documentation: {kind: 'markdown', value: ''},
    insertTextFormat: 1,
    kind: 6,
    label: 'Boolean',
    sortText: '15'
  })
})

test('ignore completion in markdown content', async () => {
  const {uri} = await serverHandle.openTextDocument(
    fixturePath('node16/completion.mdx'),
    'mdx'
  )
  const result = await serverHandle.sendCompletionRequest(uri, {
    line: 8,
    character: 10
  })

  assert.deepEqual(result, {isIncomplete: false, items: []})
})
