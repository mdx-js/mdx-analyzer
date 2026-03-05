/**
 * @fileoverview TypeScript diagnostics tests for MDX files
 *
 * These tests verify that TypeScript type errors are correctly
 * reported in MDX files through the TypeScript plugin.
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

test('type errors', async () => {
  const filePath = fixturePath('node16/type-errors.mdx')
  await server.openFile(filePath)

  try {
    const res = await server.tsserver.message({
      seq: server.nextSeq(),
      type: 'request',
      command: 'semanticDiagnosticsSync',
      arguments: {
        file: filePath
      }
    })

    assert.ok(res.success, 'Request should succeed')
    assert.ok(res.body, 'Response should have body')
    // Type errors should be reported
    assert.ok(res.body.length > 0, 'Should have type errors')
  } finally {
    await server.closeFile(filePath)
  }
})
