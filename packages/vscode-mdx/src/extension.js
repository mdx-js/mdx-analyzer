/**
 * @typedef {import('@volar/language-server').TextEdit} TextEdit
 * @typedef {import('@volar/vscode').LabsInfo} LabsInfo
 * @typedef {import('vscode').ExtensionContext} ExtensionContext
 */

import * as languageServerProtocol from '@volar/language-server/protocol.js'
import {
  activateAutoInsertion,
  activateDocumentDropEdit,
  activateTsVersionStatusItem,
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
  const tsExtension = extensions.getExtension(
    'vscode.typescript-language-features'
  )
  await tsExtension?.activate()
  const tsApi = tsExtension?.exports?.getAPI?.(0)

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

  reload()

  context.subscriptions.push(
    workspace.onDidChangeConfiguration((event) => {
      if (event.affectsConfiguration('mdx.typescript.mode')) {
        reload()
      } else if (event.affectsConfiguration('mdx.server.enable')) {
        tryRestartServer()
      }
    })
  )

  const volarLabs = createLabsInfo(languageServerProtocol)
  volarLabs.addLanguageClient(client)

  return volarLabs.extensionExports

  function reload() {
    const lsMode =
      workspace.getConfiguration('mdx').get('typescript.mode') ===
      'language-server'
    client.clientOptions.initializationOptions.typescript.enabled = lsMode
    tryRestartServer()
    tsApi.configurePlugin('@mdx-js/typescript-plugin', {enabled: !lsMode})
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

        const disposables = [
          activateAutoInsertion('mdx', client),
          activateDocumentDropEdit('mdx', client),
          activateMdxToggleCommand('toggleDelete'),
          activateMdxToggleCommand('toggleEmphasis'),
          activateMdxToggleCommand('toggleInlineCode'),
          activateMdxToggleCommand('toggleStrong')
        ]

        if (client.clientOptions.initializationOptions.typescript.enable) {
          disposables.push(
            activateTsVersionStatusItem(
              'mdx',
              'mdx.selectTypescriptVersion',
              context,
              client,
              (text) => 'TS ' + text
            )
          )
        }

        disposable = Disposable.from(...disposables)
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
