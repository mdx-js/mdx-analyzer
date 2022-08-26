import { LanguageClient, TransportKind } from 'vscode-languageclient/node.js'

/**
 * @type {LanguageClient}
 */
let client

/**
 * @param {import('vscode').ExtensionContext} context
 */
export async function activate(context) {
  /**
   * @type {import('vscode-languageclient/node.js').NodeModule}
   */
  const run = {
    module: context.asAbsolutePath('out/language-server.js'),
    transport: TransportKind.ipc,
  }

  client = new LanguageClient(
    'MDX',
    { run, debug: { ...run, options: { execArgv: ['--inspect=6009'] } } },
    { documentSelector: [{ scheme: 'file', language: 'mdx' }] },
  )

  await client.start()
}

export async function deactivate() {
  if (client) {
    await client.stop()
  }
}
