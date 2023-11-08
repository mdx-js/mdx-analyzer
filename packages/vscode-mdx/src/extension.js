/**
 * @typedef {import('@volar/vscode').ExportsInfoForLabs} ExportsInfoForLabs
 * @typedef {import('@volar/vscode').Disposable} Disposable
 * @typedef {import('vscode').ExtensionContext} ExtensionContext
 */

import * as languageServerProtocol from '@volar/language-server/protocol.js'
import {activateAutoInsertion, getTsdk, supportLabsVersion} from '@volar/vscode'
import {languages, workspace, window, ProgressLocation} from 'vscode'
import {LanguageClient, TransportKind} from '@volar/vscode/node.js'
import {documentDropEditProvider} from './document-drop-edit-provider.js'

/**
 * @type {LanguageClient}
 */
let client
/**
 * @type {Disposable[]}
 */
let features = []

/**
 * Activate the extension.
 *
 * @param {ExtensionContext} context
 *   The extension context as given by VSCode.
 * @returns {Promise<ExportsInfoForLabs | undefined>}
 *   Info for the
 *   [Volar,js Labs](https://marketplace.visualstudio.com/items?itemName=johnsoncodehk.volarjs-labs)
 *   extension.
 */
export async function activate(context) {
  const {tsdk} = await getTsdk(context)

  client = new LanguageClient(
    'MDX',
    {
      module: context.asAbsolutePath('out/language-server.js'),
      transport: TransportKind.ipc
    },
    {
      documentSelector: [{language: 'mdx'}],
      initializationOptions: {
        typescript: {tsdk}
      }
    }
  )

  tryRestartServer()

  context.subscriptions.push(
    workspace.onDidChangeConfiguration((event) => {
      if (event.affectsConfiguration('mdx.experimentalLanguageServer')) {
        tryRestartServer();
      }
    })
  )

  return {
    volarLabs: {
      version: supportLabsVersion,
      languageClients: [client],
      languageServerProtocol
    }
  }

  function tryRestartServer() {
    stopServer()
    if (workspace.getConfiguration('mdx').get('experimentalLanguageServer')) {
      startServer()
    }
  }
}

/**
 * Deactivate the extension.
 */
export async function deactivate() {
  stopServer()
}

function stopServer() {
  if (client?.needsStop()) {
    features.forEach(sub => sub.dispose())
    features.length = 0

    client.stop()
  }
}

function startServer() {
  if (client.needsStart()) {
    window.withProgress({
      location: ProgressLocation.Window,
      title: 'Starting MDX Language Server...',
    }, async () => {
      await client.start()

      features.push(
        await activateAutoInsertion([client], (document) => document.languageId === 'mdx'),
        languages.registerDocumentDropEditProvider(
          {language: 'mdx'},
          documentDropEditProvider
        )
      )
    })
  }
}
