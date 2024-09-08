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
    {typescript: {enabled: true, tsdk}}
  )
  assert.deepEqual(initializeResponse, {
    capabilities: {
      callHierarchyProvider: true,
      codeActionProvider: {
        codeActionKinds: [
          'source.organizeLinkDefinitions',
          'quickfix',
          'refactor',
          '',
          'refactor.extract',
          'refactor.inline',
          'refactor.rewrite',
          'source',
          'source.fixAll',
          'source.organizeImports'
        ],
        resolveProvider: true
      },
      completionProvider: {
        resolveProvider: true,
        triggerCharacters: ['.', '/', '#', '"', "'", '`', '<', '@', ' ', '*']
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
      implementationProvider: true,
      inlayHintProvider: {},
      referencesProvider: true,
      renameProvider: {
        prepareProvider: true
      },
      selectionRangeProvider: true,
      semanticTokensProvider: {
        full: false,
        legend: {
          tokenModifiers: [
            'declaration',
            'readonly',
            'static',
            'async',
            'defaultLibrary',
            'local'
          ],
          tokenTypes: [
            'namespace',
            'class',
            'enum',
            'interface',
            'typeParameter',
            'type',
            'parameter',
            'variable',
            'property',
            'enumMember',
            'function',
            'method'
          ]
        },
        range: true
      },
      signatureHelpProvider: {
        retriggerCharacters: [')'],
        triggerCharacters: ['(', ',', '<']
      },
      textDocumentSync: 2,
      typeDefinitionProvider: true,
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
