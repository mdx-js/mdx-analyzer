/**
 * @typedef {import('@volar/vscode').ExportsInfoForLabs} ExportsInfoForLabs
 * @typedef {import('vscode').ExtensionContext} ExtensionContext
 */

import * as languageServerProtocol from '@volar/language-server/protocol.js'
import {
  activateAutoInsertion,
  activateTsVersionStatusItem,
  getTsdk,
  supportLabsVersion
} from '@volar/vscode'
import {
  Disposable,
  languages,
  workspace,
  window,
  ProgressLocation
} from 'vscode'
import {LanguageClient, TransportKind} from '@volar/vscode/node.js'
import {documentDropEditProvider} from './document-drop-edit-provider.js'

/**
 * @type {LanguageClient}
 */
let client

/**
 * @type {Disposable}
 */
let disposable

/**
 * Activate the extension.
 *
 * @param {ExtensionContext} context
 *   The extension context as given by VSCode.
 * @returns {Promise<ExportsInfoForLabs>}
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
      if (event.affectsConfiguration('mdx.server.enable')) {
        tryRestartServer()
      }
    })
  )

  return {
    volarLabs: {
      version: supportLabsVersion,
      languageClient: client,
      languageServerProtocol
    }
  }

  async function tryRestartServer() {
    await stopServer()
    if (workspace.getConfiguration('mdx').get('server.enable')) {
      await startServer(context)
    }
  }
}

/**
 * Deactivate the extension.
 */
export async function deactivate() {
  await stopServer()
}

async function stopServer() {
  if (client?.needsStop()) {
    disposable.dispose()

    await client.stop()
  }
}

/**
 * Start the language server and client integrations.
 *
 * @param {ExtensionContext} context
 *   The extension context as given by VSCode.
 */
async function startServer(context) {
  if (client.needsStart()) {
    await window.withProgress(
      {
        location: ProgressLocation.Window,
        title: 'Starting MDX Language Server…'
      },
      async () => {
        await client.start()

        disposable = Disposable.from(
          languages.registerDocumentDropEditProvider(
            {language: 'mdx'},
            documentDropEditProvider
          ),
          activateAutoInsertion('mdx', client),
          activateTsVersionStatusItem(
            'mdx',
            'mdx.selectTypescriptVersion',
            context,
            client,
            (text) => 'TS ' + text
          )
        )
      }
    )
  }
}
