/**
 * @import {LanguageServerHandle} from '@volar/test-utils'
 */
import assert from 'node:assert/strict'
import {afterEach, beforeEach, test} from 'node:test'
import {createServer, fixturePath, fixtureUri, tsdk} from './utils.js'

/** @type {LanguageServerHandle} */
let serverHandle

beforeEach(async () => {
  serverHandle = createServer()
  await serverHandle.initialize(fixtureUri('node16'), {
    typescript: {enabled: true, tsdk}
  })
})

afterEach(() => {
  serverHandle.connection.dispose()
})

test('resolve hover in ESM', async () => {
  const {uri} = await serverHandle.openTextDocument(
    fixturePath('node16/a.mdx'),
    'mdx'
  )
  const result = await serverHandle.sendHoverRequest(uri, {
    line: 4,
    character: 3
  })

  assert.deepEqual(result, {
    contents: {
      kind: 'markdown',
      value: '```typescript\nfunction a(): void\n```\n\nDescription of `a`'
    },
    range: {
      end: {line: 4, character: 3},
      start: {line: 4, character: 2}
    }
  })
})

test('resolve import hover in ESM if the other file was previously opened', async () => {
  await serverHandle.openTextDocument(fixturePath('node16/a.mdx'), 'mdx')
  const {uri} = await serverHandle.openTextDocument(
    fixturePath('node16/b.mdx'),
    'mdx'
  )
  const result = await serverHandle.sendHoverRequest(uri, {
    line: 0,
    character: 10
  })

  assert.deepEqual(result, {
    contents: {
      kind: 'markdown',
      value:
        '```typescript\n(alias) function a(): void\nimport a\n```\n\nDescription of `a`'
    },
    range: {
      start: {line: 0, character: 9},
      end: {line: 0, character: 10}
    }
  })
})

test('resolve import hover in ESM if the other file is unopened', async () => {
  const {uri} = await serverHandle.openTextDocument(
    fixturePath('node16/b.mdx'),
    'mdx'
  )
  const result = await serverHandle.sendHoverRequest(uri, {
    line: 0,
    character: 10
  })

  assert.deepEqual(result, {
    contents: {
      kind: 'markdown',
      value:
        '```typescript\n(alias) function a(): void\nimport a\n```\n\nDescription of `a`'
    },
    range: {
      start: {line: 0, character: 9},
      end: {line: 0, character: 10}
    }
  })
})

test('resolve import hover in JSX expressions', async () => {
  const {uri} = await serverHandle.openTextDocument(
    fixturePath('node16/a.mdx'),
    'mdx'
  )
  const result = await serverHandle.sendHoverRequest(uri, {
    line: 11,
    character: 1
  })

  assert.deepEqual(result, {
    contents: {
      kind: 'markdown',
      value: '```typescript\nfunction a(): void\n```\n\nDescription of `a`'
    },
    range: {
      start: {line: 11, character: 1},
      end: {line: 11, character: 2}
    }
  })
})

test('support mdxJsxTextElement', async () => {
  const {uri} = await serverHandle.openTextDocument(
    fixturePath('node16/mdx-jsx-text-element.mdx'),
    'mdx'
  )
  const result = await serverHandle.sendHoverRequest(uri, {
    line: 3,
    character: 5
  })

  assert.deepEqual(result, {
    contents: {
      kind: 'markdown',
      value:
        '```typescript\nfunction Component(): void\n```\n\nDescription of `Component`'
    },
    range: {
      start: {line: 3, character: 1},
      end: {line: 3, character: 10}
    }
  })
})

test('resolve import hover in JSX elements', async () => {
  const {uri} = await serverHandle.openTextDocument(
    fixturePath('node16/a.mdx'),
    'mdx'
  )
  const result = await serverHandle.sendHoverRequest(uri, {
    line: 13,
    character: 5
  })

  assert.deepEqual(result, {
    contents: {
      kind: 'markdown',
      value: '```typescript\nfunction Component(): JSX.Element\n```'
    },
    range: {
      start: {line: 13, character: 1},
      end: {line: 13, character: 10}
    }
  })
})

test('ignore non-existent mdx files', async () => {
  const uri = fixtureUri('node16/non-existent.mdx')
  const result = await serverHandle.sendHoverRequest(uri, {
    line: 7,
    character: 15
  })

  assert.deepEqual(result, null)
})
