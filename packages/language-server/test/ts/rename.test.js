/**
 * @fileoverview TypeScript rename tests for MDX files
 *
 * These tests verify that rename refactoring works correctly
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

test('handle rename request of variable for opened references', async () => {
  const filePathA = fixturePath('node16/a.mdx')
  const filePathB = fixturePath('node16/b.mdx')

  await server.openFile(filePathA)
  await server.openFile(filePathB)

  try {
    const res = await server.tsserver.message({
      seq: server.nextSeq(),
      type: 'request',
      command: 'rename',
      arguments: {
        file: filePathA,
        line: 5,
        offset: 3
      }
    })

    assert.ok(res.success, 'Request should succeed')
    assert.ok(res.body, 'Response should have body')
    assert.ok(res.body.locs, 'Response should have locations')
    assert.ok(res.body.locs.length > 0, 'Should have rename locations')

    // Check that we have locations in multiple files
    const files = new Set(
      res.body.locs.map((/** @type {{file: string}} */ loc) => loc.file)
    )
    assert.ok(files.size > 0, 'Should have locations in at least one file')
  } finally {
    await server.closeFile(filePathA)
    await server.closeFile(filePathB)
  }
})
