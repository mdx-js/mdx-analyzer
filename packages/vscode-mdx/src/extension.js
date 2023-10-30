/**
 * @typedef {import('vscode').ExtensionContext} ExtensionContext
 */

import * as path from 'node:path'
import {DiagnosticModel} from '@volar/language-server'
import * as languageServerProtocol from '@volar/language-server/protocol.js'
import {activateAutoInsertion, supportLabsVersion} from '@volar/vscode'
import {env, languages, workspace} from 'vscode'
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

  client = new LanguageClient(
    'MDX',
    {module: context.asAbsolutePath('out/language-server.js')},
    {
      documentSelector: [{language: 'mdx'}],
      initializationOptions: {
        typescript: {
          tsdk: path.join(env.appRoot, 'extensions/node_modules/typescript/lib')
        },
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
