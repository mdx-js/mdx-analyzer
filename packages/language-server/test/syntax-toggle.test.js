/**
 * @import {LanguageServerHandle} from '@volar/test-utils'
 * @import {SyntaxToggleParams} from '@mdx-js/language-service'
 */
import assert from 'node:assert/strict'
import {afterEach, beforeEach, test} from 'node:test'
import {createServer, fixtureUri, tsdk} from './utils.js'

/** @type {LanguageServerHandle} */
let serverHandle

beforeEach(async () => {
  serverHandle = createServer()
  await serverHandle.initialize(fixtureUri('node16'), {
    typescript: {enabled: false, tsdk}
  })
})

afterEach(() => {
  serverHandle.connection.dispose()
})

test('delete', async () => {
  await serverHandle.openInMemoryDocument('memory://1', 'mdx', 'Hello\n')
  const result = await serverHandle.connection.sendRequest(
    'mdx/toggleDelete',
    /** @satisfies {SyntaxToggleParams} */ ({
      uri: 'memory://1',
      range: {end: {character: 3, line: 0}, start: {character: 3, line: 0}}
    })
  )

  assert.deepEqual(result, [
    {
      newText: '~',
      range: {end: {character: 0, line: 0}, start: {character: 0, line: 0}}
    },
    {
      newText: '~',
      range: {end: {character: 5, line: 0}, start: {character: 5, line: 0}}
    }
  ])
})

test('emphasis', async () => {
  await serverHandle.openInMemoryDocument('memory://1', 'mdx', 'Hello\n')
  const result = await serverHandle.connection.sendRequest(
    'mdx/toggleEmphasis',
    /** @satisfies {SyntaxToggleParams} */ ({
      uri: 'memory://1',
      range: {end: {character: 3, line: 0}, start: {character: 3, line: 0}}
    })
  )

  assert.deepEqual(result, [
    {
      newText: '_',
      range: {end: {character: 0, line: 0}, start: {character: 0, line: 0}}
    },
    {
      newText: '_',
      range: {end: {character: 5, line: 0}, start: {character: 5, line: 0}}
    }
  ])
})

test('inlineCode', async () => {
  await serverHandle.openInMemoryDocument('memory://1', 'mdx', 'Hello\n')
  const result = await serverHandle.connection.sendRequest(
    'mdx/toggleInlineCode',
    /** @satisfies {SyntaxToggleParams} */ ({
      uri: 'memory://1',
      range: {end: {character: 3, line: 0}, start: {character: 3, line: 0}}
    })
  )

  assert.deepEqual(result, [
    {
      newText: '`',
      range: {end: {character: 0, line: 0}, start: {character: 0, line: 0}}
    },
    {
      newText: '`',
      range: {end: {character: 5, line: 0}, start: {character: 5, line: 0}}
    }
  ])
})

test('strong', async () => {
  await serverHandle.openInMemoryDocument('memory://1', 'mdx', 'Hello\n')
  const result = await serverHandle.connection.sendRequest(
    'mdx/toggleStrong',
    /** @satisfies {SyntaxToggleParams} */ ({
      uri: 'memory://1',
      range: {end: {character: 3, line: 0}, start: {character: 3, line: 0}}
    })
  )

  assert.deepEqual(result, [
    {
      newText: '**',
      range: {end: {character: 0, line: 0}, start: {character: 0, line: 0}}
    },
    {
      newText: '**',
      range: {end: {character: 5, line: 0}, start: {character: 5, line: 0}}
    }
  ])
})
