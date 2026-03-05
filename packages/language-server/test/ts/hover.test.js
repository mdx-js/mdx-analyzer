/**
 * @fileoverview TypeScript hover tests for MDX files
 *
 * These tests verify that TypeScript hover information works correctly
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

test('resolve hover in ESM', async () => {
  const filePath = fixturePath('node16/a.mdx')
  await server.openFile(filePath)

  try {
    const res = await server.tsserver.message({
      seq: server.nextSeq(),
      type: 'request',
      command: 'quickinfo',
      arguments: {
        file: filePath,
        line: 5,
        offset: 3
      }
    })

    assert.ok(res.success, 'Request should succeed')
    assert.ok(res.body, 'Response should have body')
    assert.ok(
      res.body.displayString.includes('function a'),
      'Should show function signature'
    )
  } finally {
    await server.closeFile(filePath)
  }
})

test('resolve import hover in JSX expressions', async () => {
  const filePath = fixturePath('node16/a.mdx')
  await server.openFile(filePath)

  try {
    const res = await server.tsserver.message({
      seq: server.nextSeq(),
      type: 'request',
      command: 'quickinfo',
      arguments: {
        file: filePath,
        line: 12,
        offset: 2
      }
    })

    assert.ok(res.success, 'Request should succeed')
    assert.ok(res.body, 'Response should have body')
    assert.ok(
      res.body.displayString.includes('function a'),
      'Should show function signature'
    )
  } finally {
    await server.closeFile(filePath)
  }
})

test('support mdxJsxTextElement', async () => {
  const filePath = fixturePath('node16/mdx-jsx-text-element.mdx')
  await server.openFile(filePath)

  try {
    const res = await server.tsserver.message({
      seq: server.nextSeq(),
      type: 'request',
      command: 'quickinfo',
      arguments: {
        file: filePath,
        line: 4,
        offset: 5
      }
    })

    assert.ok(res.success, 'Request should succeed')
    assert.ok(res.body, 'Response should have body')
    assert.ok(
      res.body.displayString.includes('Component'),
      'Should show Component'
    )
  } finally {
    await server.closeFile(filePath)
  }
})

test('resolve import hover in JSX elements', async () => {
  const filePath = fixturePath('node16/a.mdx')
  await server.openFile(filePath)

  try {
    const res = await server.tsserver.message({
      seq: server.nextSeq(),
      type: 'request',
      command: 'quickinfo',
      arguments: {
        file: filePath,
        line: 14,
        offset: 5
      }
    })

    assert.ok(res.success, 'Request should succeed')
    assert.ok(res.body, 'Response should have body')
    assert.ok(
      res.body.displayString.includes('Component'),
      'Should show Component'
    )
  } finally {
    await server.closeFile(filePath)
  }
})
