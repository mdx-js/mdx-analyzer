/**
 * @fileoverview TypeScript definition tests for MDX files
 *
 * These tests verify that go-to-definition works correctly
 * in MDX files through the TypeScript plugin.
 */
import assert from 'node:assert/strict'
import {after, before, test} from 'node:test'
import {fixturePath, getTsServer} from './server.js'

/** @type {Awaited<ReturnType<typeof getTsServer>>} */
let server

before(async () => {
  server = await getTsServer()
})

after(() => {
  server.shutdown()
})

test('resolve file-local definitions in ESM', async () => {
  const filePath = fixturePath('node16/a.mdx')
  await server.openFile(filePath)

  try {
    const res = await server.tsserver.message({
      seq: server.nextSeq(),
      type: 'request',
      command: 'definition',
      arguments: {
        file: filePath,
        line: 5,
        offset: 3
      }
    })

    assert.ok(res.success, 'Request should succeed')
    assert.ok(res.body, 'Response should have body')
    assert.ok(res.body.length > 0, 'Should have at least one definition')

    const def = res.body[0]
    assert.ok(def.file.endsWith('a.mdx'), 'Definition should be in a.mdx')
    assert.equal(def.start.line, 2, 'Definition should be on line 2')
  } finally {
    await server.closeFile(filePath)
  }
})
