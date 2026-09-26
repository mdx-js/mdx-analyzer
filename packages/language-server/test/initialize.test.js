/**
 * @import {LanguageServerHandle} from '@volar/test-utils'
 */
import assert from 'node:assert/strict'
import {afterEach, beforeEach, test} from 'node:test'
import {createServer, fixtureUri, tsdk} from './utils.js'

/** @type {LanguageServerHandle} */
let serverHandle

beforeEach(async () => {
  serverHandle = createServer()
})

afterEach(() => {
  serverHandle.connection.dispose()
})

test('initialize', async () => {
  const {serverInfo, ...initializeResponse} = await serverHandle.initialize(
    fixtureUri('node16'),
    {typescript: {tsdk}}
  )
  assert.deepEqual(initializeResponse, {
    capabilities: {
      codeActionProvider: {
        codeActionKinds: [
          'source.organizeLinkDefinitions',
          'quickfix',
          'refactor'
        ],
        resolveProvider: true
      },
      completionProvider: {
        triggerCharacters: ['.', '/', '#']
      },
      definitionProvider: true,
      documentHighlightProvider: true,
      documentLinkProvider: {
        resolveProvider: true
      },
      documentSymbolProvider: true,
      executeCommandProvider: {
        commands: [
          'mdx.toggleDelete',
          'mdx.toggleEmphasis',
          'mdx.toggleInlineCode',
          'mdx.toggleStrong'
        ]
      },
      experimental: {
        documentDropEditsProvider: true,
        fileReferencesProvider: true,
        fileRenameEditsProvider: true
      },
      foldingRangeProvider: true,
      hoverProvider: true,
      referencesProvider: true,
      renameProvider: {
        prepareProvider: true
      },
      selectionRangeProvider: true,
      textDocumentSync: 2,
      workspace: {
        workspaceFolders: {
          changeNotifications: true,
          supported: true
        }
      },
      workspaceSymbolProvider: {}
    }
  })
})
