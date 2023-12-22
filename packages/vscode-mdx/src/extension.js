/**
 * @typedef {import('@volar/vscode').LabsInfo} LabsInfo
 * @typedef {import('vscode').ExtensionContext} ExtensionContext
 */

import * as languageServerProtocol from '@volar/language-server/protocol.js'
import {
  activateAutoInsertion,
  activateDocumentDropEdit,
  createLabsInfo,
  getTsdk
} from '@volar/vscode'
import {Disposable, workspace, window, ProgressLocation, extensions} from 'vscode'
import {LanguageClient, TransportKind} from '@volar/vscode/node.js'

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
 * @returns {Promise<LabsInfo>}
 *   Info for the
 *   [Volar,js Labs](https://marketplace.visualstudio.com/items?itemName=johnsoncodehk.volarjs-labs)
 *   extension.
 */
export async function activate(context) {
  extensions.getExtension('vscode.typescript-language-features')?.activate()

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
      },
      markdown: {
        isTrusted: true,
        supportHtml: true
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

  const volarLabs = createLabsInfo(languageServerProtocol)
  volarLabs.addLanguageClient(client)

  return volarLabs.extensionExports

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
          activateAutoInsertion('mdx', client),
          activateDocumentDropEdit('mdx', client)
        )
      }
    )
  }
}

// Track https://github.com/microsoft/vscode/issues/200511
try {
  const tsExtension = extensions.getExtension(
    'vscode.typescript-language-features'
  )
  if (tsExtension) {
    const readFileSync = require('node:fs').readFileSync
    const extensionJsPath = require.resolve('./dist/extension.js', {
      paths: [tsExtension.extensionPath]
    })

    // @ts-expect-error
    require('node:fs').readFileSync = (...args) => {
      if (args[0] === extensionJsPath) {
        /** @type {string} */
        let text = readFileSync(...args)

        // patch jsTsLanguageModes
        text = text.replace(
          't.$u=[t.$r,t.$s,t.$p,t.$q]',
          (s) => s + '.concat("mdx")'
        )

        // patch isSupportedLanguageMode
        text = text.replace(
          's.languages.match([t.$p,t.$q,t.$r,t.$s]',
          (s) => s + '.concat("mdx")'
        )

        return text
      }

      return readFileSync(...args)
    }
  }
} catch {}
