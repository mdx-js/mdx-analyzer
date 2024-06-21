/**
 * @import {LabsInfo, TextEdit} from '@volar/vscode'
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
  commands,
  extensions,
  window,
  workspace,
  Disposable,
  ProgressLocation,
  WorkspaceEdit
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
          activateDocumentDropEdit('mdx', client),
          activateMdxToggleCommand('toggleDelete'),
          activateMdxToggleCommand('toggleEmphasis'),
          activateMdxToggleCommand('toggleInlineCode'),
          activateMdxToggleCommand('toggleStrong')
        )
      }
    )
  }
}

/**
 * @param {string} command
 * @returns {Disposable}
 */
function activateMdxToggleCommand(command) {
  return commands.registerCommand('mdx.' + command, async () => {
    const editor = window.activeTextEditor
    if (!editor) {
      return
    }

    const document = editor.document
    const beforeVersion = document.version

    /** @type {TextEdit[] | undefined} */
    const response = await client.sendRequest('mdx/' + command, {
      uri: String(document.uri),
      range: client.code2ProtocolConverter.asRange(editor.selection)
    })

    if (!response?.length) {
      return
    }

    const textEdits = await client.protocol2CodeConverter.asTextEdits(response)

    if (beforeVersion !== document.version) {
      return
    }

    const workspaceEdit = new WorkspaceEdit()
    workspaceEdit.set(document.uri, textEdits)
    workspace.applyEdit(workspaceEdit, {})
  })
}
