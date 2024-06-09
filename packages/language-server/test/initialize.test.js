/**
 * @typedef {import('@volar/test-utils').LanguageServerHandle} LanguageServerHandle
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
    autoInsertion: {
      configurationSections: [
        'javascript.autoClosingTags',
        'typescript.autoClosingTags'
      ],
      triggerCharacters: ['>', '>']
    },
    capabilities: {
      callHierarchyProvider: true,
      codeActionProvider: {
        codeActionKinds: [
          '',
          'quickfix',
          'refactor',
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
            'definition',
            'readonly',
            'static',
            'deprecated',
            'abstract',
            'async',
            'modification',
            'documentation',
            'defaultLibrary'
          ],
          tokenTypes: [
            'namespace',
            'class',
            'enum',
            'interface',
            'struct',
            'typeParameter',
            'type',
            'parameter',
            'variable',
            'property',
            'enumMember',
            'decorator',
            'event',
            'function',
            'method',
            'macro',
            'label',
            'comment',
            'string',
            'keyword',
            'number',
            'regexp',
            'operator'
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
      workspaceSymbolProvider: true
    }
  })
})
