/**
 * @fileoverview TypeScript server test utilities for MDX
 *
 * This module provides utilities for testing TypeScript features in MDX files
 * using @typescript/server-harness. It follows the pattern established by
 * Vue Language Tools.
 *
 * @see https://github.com/vuejs/language-tools/blob/master/packages/language-server/tests/server.ts
 */
import {createRequire} from 'node:module'
import path from 'node:path'
import {launchServer} from '@typescript/server-harness'
import {URI} from 'vscode-uri'

const require = createRequire(import.meta.url)

/** @type {import('@typescript/server-harness').Server | undefined} */
let tsserver

/** @type {number} */
let seq = 1

/**
 * The path to the fixtures directory.
 */
export const fixturesPath = path.resolve(
  new URL('.', import.meta.url).pathname,
  '../../../../fixtures'
)

/**
 * Get or create the TypeScript server instance.
 *
 * @returns {Promise<{
 *   tsserver: import('@typescript/server-harness').Server,
 *   nextSeq: () => number,
 *   openFile: (filePath: string, content?: string) => Promise<void>,
 *   closeFile: (filePath: string) => Promise<void>,
 *   shutdown: () => void
 * }>}
 */
export async function getTsServer() {
  if (!tsserver) {
    const tsserverPath = require.resolve('typescript/lib/tsserver.js')
    const pluginPath = require.resolve('@mdx-js/typescript-plugin')

    tsserver = launchServer(tsserverPath, [
      '--disableAutomaticTypingAcquisition',
      '--globalPlugins',
      pluginPath,
      '--suppressDiagnosticEvents'
      // Uncomment for debugging:
      // '--logVerbosity', 'verbose',
      // '--logFile', path.join(fixturesPath, 'tsserver.log'),
    ])

    tsserver.on('exit', (code) =>
      console.log(code ? `Exited with code ${code}` : 'Terminated')
    )
  }

  const server = tsserver

  return {
    tsserver: server,
    nextSeq: () => seq++,
    /**
     * Open a file in tsserver.
     *
     * @param {string} filePath - The absolute path to the file.
     * @param {string} [content] - Optional content to use instead of reading from disk.
     */
    async openFile(filePath, content) {
      /** @type {{file: string, fileContent?: string}} */
      const args = {file: filePath}
      if (content !== undefined) {
        args.fileContent = content
      }

      const res = await server.message({
        seq: seq++,
        type: 'request',
        command: 'open',
        arguments: args
      })
      if (!res.success) {
        throw new Error(`Failed to open file: ${res.message}`)
      }
    },
    /**
     * Close a file in tsserver.
     *
     * @param {string} filePath - The absolute path to the file.
     */
    async closeFile(filePath) {
      const res = await server.message({
        seq: seq++,
        type: 'request',
        command: 'close',
        arguments: {file: filePath}
      })
      if (!res.success) {
        throw new Error(`Failed to close file: ${res.message}`)
      }
    },
    /**
     * Shutdown the tsserver.
     */
    shutdown() {
      if (tsserver) {
        tsserver.kill()
        tsserver = undefined
      }
    }
  }
}

/**
 * Get the absolute path for a fixture file.
 *
 * @param {string} relativePath - The relative path from the fixtures directory.
 * @returns {string} The absolute path.
 */
export function fixturePath(relativePath) {
  return path.join(fixturesPath, relativePath).replaceAll('\\', '/')
}

/**
 * Get the file URI for a fixture file.
 *
 * @param {string} relativePath - The relative path from the fixtures directory.
 * @returns {string} The file URI.
 */
export function fixtureUri(relativePath) {
  return URI.file(fixturePath(relativePath)).toString()
}
