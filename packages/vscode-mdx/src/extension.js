/**
 * @typedef {import('vscode').ExtensionContext} ExtensionContext
 */

import {workspace} from 'vscode'
import {LanguageClient} from 'vscode-languageclient/node.js'

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

  const module = context.asAbsolutePath('out/language-server.js')

  client = new LanguageClient(
    'MDX',
    {
      run: {module},
      debug: {module, options: {execArgv: ['--inspect=6009', '--nolazy']}}
    },
    {
      documentSelector: [
        {scheme: 'file', language: 'mdx'},
        {scheme: 'file', language: 'typescript'},
        {scheme: 'file', language: 'typescriptreact'},
        {scheme: 'file', language: 'javascript'},
        {scheme: 'file', language: 'javascriptreact'}
      ]
    }
  )

  await client.start()
}

/**
 * Deactivate the extension.
 */
export async function deactivate() {
  if (client) {
    await client.stop()
  }
}
