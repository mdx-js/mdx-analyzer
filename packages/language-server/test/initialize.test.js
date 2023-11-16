/**
 * @typedef {import('@volar/language-server').ProtocolConnection} ProtocolConnection
 */
import assert from 'node:assert/strict'
import {afterEach, beforeEach, test} from 'node:test'
import {InitializeRequest} from '@volar/language-server'
import {createConnection, fixtureUri, tsdk} from './utils.js'

/** @type {ProtocolConnection} */
let connection

beforeEach(() => {
  connection = createConnection()
})

afterEach(() => {
  connection.dispose()
})

test('initialize', async () => {
  const initializeResponse = await connection.sendRequest(
    InitializeRequest.type,
    {
      processId: null,
      rootUri: fixtureUri('node16'),
      capabilities: {},
      initializationOptions: {typescript: {tsdk}}
    }
  )
  assert.deepEqual(initializeResponse, {
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
      codeLensProvider: {resolveProvider: true},
      colorProvider: true,
      completionProvider: {
        resolveProvider: true,
        triggerCharacters: ['.', '"', "'", '`', '/', '<', '@', '#', ' ', '*']
      },
      definitionProvider: true,
      documentFormattingProvider: true,
      documentHighlightProvider: true,
      documentLinkProvider: {resolveProvider: true},
      documentOnTypeFormattingProvider: {
        firstTriggerCharacter: ';',
        moreTriggerCharacter: ['}', '\n']
      },
      documentRangeFormattingProvider: true,
      documentSymbolProvider: true,
      foldingRangeProvider: true,
      hoverProvider: true,
      implementationProvider: true,
      inlayHintProvider: {resolveProvider: true},
      linkedEditingRangeProvider: true,
      referencesProvider: true,
      renameProvider: {prepareProvider: true},
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
        fileOperations: {
          willRename: {
            filters: [
              {pattern: {glob: '**/*.{cjs,ctx,js,json,mdx,mjs,mts,ts,tsx}'}}
            ]
          }
        }
      },
      workspaceSymbolProvider: true
    }
  })
})
