/**
 * @fileoverview Language server initialization tests
 *
 * Note: The capabilities returned by the language server depend on the
 * service plugins configured. Since TypeScript support has been moved to
 * the TypeScript plugin, some capabilities are no longer provided by the
 * language server directly.
 *
 * @import {LanguageServerHandle} from '@volar/test-utils'
 */
import assert from 'node:assert/strict'
import {afterEach, beforeEach, test} from 'node:test'
import {createServer, fixtureUri} from './utils.js'

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
    {}
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
      documentFormattingProvider: true,
      documentHighlightProvider: true,
      documentLinkProvider: {
        resolveProvider: true
      },
      documentOnTypeFormattingProvider: {
        firstTriggerCharacter: ';',
        moreTriggerCharacter: ['}', '\n']
      },
      documentRangeFormattingProvider: true,
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
        autoInsertionProvider: {
          configurationSections: [
            ['javascript.autoClosingTags', 'typescript.autoClosingTags']
          ],
          triggerCharacters: ['>']
        },
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
