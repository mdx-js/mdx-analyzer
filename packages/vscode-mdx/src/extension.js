/**
 * @typedef {import('vscode').ExtensionContext} ExtensionContext
 */

import {DiagnosticModel} from '@volar/language-server'
import * as languageServerProtocol from '@volar/language-server/protocol.js'
import {activateAutoInsertion, getTsdk, supportLabsVersion} from '@volar/vscode'
import {languages, workspace} from 'vscode'
import {LanguageClient} from 'vscode-languageclient/node.js'
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
 */
export async function activate(context) {
  if (!workspace.getConfiguration('mdx').get('experimentalLanguageServer')) {
    return
  }

  const {tsdk} = await getTsdk(context)

  client = new LanguageClient(
    'MDX',
    {module: context.asAbsolutePath('out/language-server.js')},
    {
      documentSelector: [{language: 'mdx'}],
      initializationOptions: {
        typescript: {tsdk},
        diagnosticModel: DiagnosticModel.Pull
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
