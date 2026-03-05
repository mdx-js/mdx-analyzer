/**
 * @fileoverview TypeScript completion tests for MDX files
 *
 * These tests verify that code completion works correctly
 * in MDX files through the TypeScript plugin.
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

test('support completion in ESM', async () => {
  const filePath = fixturePath('node16/completion.mdx')
  await server.openFile(filePath)

  try {
    const res = await server.tsserver.message({
      seq: server.nextSeq(),
      type: 'request',
      command: 'completions',
      arguments: {
        file: filePath,
        line: 2,
        offset: 1,
        includeExternalModuleExports: true
      }
    })

    assert.ok(res.success, 'Request should succeed')
    assert.ok(res.body, 'Response should have body')
    assert.ok(res.body.length > 0, 'Should have completions')

    const booleanCompletion = res.body.find(
      (/** @type {{name: string}} */ c) => c.name === 'Boolean'
    )
    assert.ok(booleanCompletion, 'Should have Boolean completion')
  } finally {
    await server.closeFile(filePath)
  }
})

test('support completion in JSX', async () => {
  const filePath = fixturePath('node16/completion.mdx')
  await server.openFile(filePath)

  try {
    const res = await server.tsserver.message({
      seq: server.nextSeq(),
      type: 'request',
      command: 'completions',
      arguments: {
        file: filePath,
        line: 6,
        offset: 3,
        includeExternalModuleExports: true
      }
    })

    assert.ok(res.success, 'Request should succeed')
    assert.ok(res.body, 'Response should have body')
    assert.ok(res.body.length > 0, 'Should have completions')

    const booleanCompletion = res.body.find(
      (/** @type {{name: string}} */ c) => c.name === 'Boolean'
    )
    assert.ok(booleanCompletion, 'Should have Boolean completion')
  } finally {
    await server.closeFile(filePath)
  }
})
