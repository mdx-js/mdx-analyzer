/**
 * @import {ExecuteCommandSignature, LabsInfo, TextEdit} from '@volar/vscode'
 * @import {ExtensionContext} from 'vscode'
 */

/* eslint-disable unicorn/prefer-module, no-import-assign */

import * as fs from 'node:fs'
import * as languageServerProtocol from '@volar/language-server/protocol.js'
import {
  activateAutoInsertion,
  activateDocumentDropEdit,
  createLabsInfo
} from '@volar/vscode'
import {
  commands,
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

// Patch TypeScript extension before activation
const neededRestart = !patchTypeScriptExtension()

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

  // Prompt user to restart if patching failed because TS extension was already active
  if (neededRestart) {
    const action = await window.showInformationMessage(
      'Please restart the extension host to activate MDX TypeScript support.',
      'Restart Extension Host',
      'Reload Window'
    )
    if (action === 'Restart Extension Host') {
      commands.executeCommand('workbench.action.restartExtensionHost')
    } else if (action === 'Reload Window') {
      commands.executeCommand('workbench.action.reloadWindow')
    }
  }

  client = new LanguageClient(
    'MDX',
    {
      module: context.asAbsolutePath('out/language-server.js'),
      transport: TransportKind.ipc
    },
    {
      documentSelector: [{language: 'mdx'}],
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
          activateDocumentDropEdit('mdx', client),
          activateTsServerBridge()
        )
      }
    )
  }
}

/**
 * Activate the TypeScript server bridge for language server communication.
 *
 * @returns {Disposable}
 *   A disposable to clean up the bridge.
 */
function activateTsServerBridge() {
  // Forward tsserver requests from language server to TypeScript extension
  const requestDisposable = client.onNotification(
    'tsserver/request',
    /**
     * @param {[number, string, unknown]} params
     */
    async ([id, command, args]) => {
      try {
        /** @type {{body?: unknown} | undefined} */
        const response = await commands.executeCommand(
          'typescript.tsserverRequest',
          command,
          args
        )
        client.sendNotification('tsserver/response', [id, response?.body])
      } catch {
        client.sendNotification('tsserver/response', [id, null])
      }
    }
  )

  return Disposable.from(requestDisposable)
}

/**
 * Patch the TypeScript extension to support MDX files.
 *
 * This hack modifies the TypeScript extension's internal code to:
 * 1. Include 'mdx' in the list of supported language modes
 * 2. Ensure the MDX TypeScript plugin is loaded with high priority
 *
 * This approach is based on Vue Language Tools' implementation:
 * https://github.com/vuejs/language-tools/blob/master/extensions/vscode/src/extension.ts
 *
 * @returns {boolean}
 *   Whether the patch was successful. Returns false if the TypeScript
 *   extension was already active (requires restart).
 */
function patchTypeScriptExtension() {
  const tsExtension = extensions.getExtension(
    'vscode.typescript-language-features'
  )
  if (!tsExtension) {
    return true // No TS extension, nothing to patch
  }

  if (tsExtension.isActive) {
    return false // TS extension already active, needs restart
  }

  const {readFileSync} = fs
  /** @type {string} */
  let extensionJsPath
  try {
    extensionJsPath = require.resolve('./dist/extension.js', {
      paths: [tsExtension.extensionPath]
    })
  } catch {
    return true // Could not find extension.js, skip patching
  }

  const mdxExtension = extensions.getExtension('unifiedjs.vscode-mdx')
  if (!mdxExtension) {
    return true // MDX extension not found
  }

  const tsPluginName = '@mdx-js/typescript-plugin'

  // Patch fs.readFileSync to modify TypeScript extension's code
  // @ts-expect-error - overriding fs.readFileSync
  fs.readFileSync = (
    /** @type {fs.PathOrFileDescriptor} */ filePath,
    /** @type {any} */ options
  ) => {
    if (filePath === extensionJsPath) {
      let text = String(readFileSync(filePath, options))

      // Patch jsTsLanguageModes to include 'mdx'
      text = text.replace(
        't.jsTsLanguageModes=[t.javascript,t.javascriptreact,t.typescript,t.typescriptreact]',
        (s) => s + '.concat("mdx")'
      )

      // Patch isSupportedLanguageMode to include 'mdx'
      text = text.replace(
        '.languages.match([t.typescript,t.typescriptreact,t.javascript,t.javascriptreact]',
        (s) => s + '.concat("mdx")'
      )

      // Patch isTypeScriptDocument to include 'mdx'
      text = text.replace(
        '.languages.match([t.typescript,t.typescriptreact]',
        (s) => s + '.concat("mdx")'
      )

      // Sort plugins to ensure MDX plugin has high priority
      // This is needed for compatibility with other TS plugins
      text = text.replace(
        '"--globalPlugins",i.plugins',
        (s) =>
          s +
          `.sort((a,b)=>(b.name==="${tsPluginName}"?-1:0)-(a.name==="${tsPluginName}"?-1:0))`
      )

      return text
    }

    return readFileSync(filePath, options)
  }

  // Clear require cache and reload the patched module
  const loadedModule = require.cache[extensionJsPath]
  if (loadedModule) {
    delete require.cache[extensionJsPath]
    const patchedModule = require(extensionJsPath)
    Object.assign(loadedModule.exports, patchedModule)
  }

  return true
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
