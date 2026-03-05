/**
 * @fileoverview TypeScript code action tests for MDX files
 *
 * These tests verify that code actions (like organize imports)
 * work correctly in MDX files through the TypeScript plugin.
 */
import assert from 'node:assert/strict'
import {after, before, test} from 'node:test'
import {fixturePath} from '../utils.js'
import {getTsServer} from './server.js'

/** @type {Awaited<ReturnType<typeof getTsServer>>} */
let server

before(async () => {
  server = await getTsServer()
})

after(() => {
  server.shutdown()
})

test('organize imports', async () => {
  const filePath = fixturePath('node16/organize-imports.mdx')
  await server.openFile(filePath)

  try {
    const res = await server.tsserver.message({
      seq: server.nextSeq(),
      type: 'request',
      command: 'organizeImports',
      arguments: {
        scope: {
          type: 'file',
          args: {file: filePath}
        }
      }
    })

    assert.ok(res.success, 'Request should succeed')
    assert.ok(res.body, 'Response should have body')
    // Organize imports should return file changes
    assert.ok(Array.isArray(res.body), 'Response body should be an array')
  } finally {
    await server.closeFile(filePath)
  }
})
