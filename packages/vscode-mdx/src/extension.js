/**
 * @typedef {import('@volar/vscode').ExportsInfoForLabs} ExportsInfoForLabs
 * @typedef {import('vscode').ExtensionContext} ExtensionContext
 */

import * as languageServerProtocol from '@volar/language-server/protocol.js'
import {activateAutoInsertion, getTsdk, supportLabsVersion} from '@volar/vscode'
import {languages, workspace} from 'vscode'
import {LanguageClient, TransportKind} from '@volar/vscode/node.js'
import {documentDropEditProvider} from './document-drop-edit-provider.js'

/**
 * @type {LanguageClient}
 */
let client

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
  if (!workspace.getConfiguration('mdx').get('experimentalLanguageServer')) {
    return
  }

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

  await client.start()

  activateAutoInsertion([client], (document) => document.languageId === 'mdx')

  context.subscriptions.push(
    languages.registerDocumentDropEditProvider(
      {language: 'mdx'},
      documentDropEditProvider
    )
  )

  return {
    volarLabs: {
      version: supportLabsVersion,
      languageClients: [client],
      languageServerProtocol
    }
  }
}

/**
 * Deactivate the extension.
 */
export async function deactivate() {
  if (client) {
    await client.stop()
  }
}
