/**
 * @import {ExecuteCommandSignature, LabsInfo, TextEdit} from '@volar/vscode'
 * @import {ExtensionContext} from 'vscode'
 */

import * as languageServerProtocol from '@volar/language-server/protocol.js'
import {
  activateAutoInsertion,
  activateDocumentDropEdit,
  createLabsInfo,
  getTsdk
} from '@volar/vscode'
import {
  extensions,
  window,
  workspace,
  Disposable,
  ProgressLocation
} from 'vscode'
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

  const {tsdk} = (await getTsdk(context)) ?? {tsdk: ''}

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
      },
      middleware: {executeCommand}
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
      await startServer()
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
 */
async function startServer() {
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

/**
 * Execute a command with correct arguments.
 *
 * @param {string} command
 *   The name of the command to execute.
 * @param {unknown[]} args
 *   The original arguments passed to the command.
 * @param {ExecuteCommandSignature} next
 *   The next middleware to execute.
 * @returns {Promise<unknown>}
 *   The command result.
 */
async function executeCommand(command, args, next) {
  switch (command) {
    case 'mdx.toggleDelete':
    case 'mdx.toggleEmphasis':
    case 'mdx.toggleInlineCode':
    case 'mdx.toggleStrong': {
      const editor = window.activeTextEditor
      if (!editor) {
        return
      }

      return next(command, [
        String(editor.document.uri),
        client.code2ProtocolConverter.asRange(editor.selection)
      ])
    }

    default: {
      return next(command, args)
    }
  }
}
