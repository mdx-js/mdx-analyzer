/**
 * @import {LanguageServerHandle} from '@volar/test-utils'
 * @import {Range} from '@volar/language-server'
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
  const editsPromise = new Promise((resolve) => {
    serverHandle.connection.onRequest('workspace/applyEdit', resolve)
  })
  const result = await serverHandle.sendExecuteCommandRequest(
    'mdx.toggleDelete',
    [
      'memory://1',
      /** @satisfies {Range} */
      ({end: {character: 3, line: 0}, start: {character: 3, line: 0}})
    ]
  )

  assert.equal(result, null)
  assert.deepEqual(await editsPromise, {
    edit: {
      changes: {
        'memory://1': [
          {
            newText: '~~',
            range: {
              end: {character: 0, line: 0},
              start: {character: 0, line: 0}
            }
          },
          {
            newText: '~~',
            range: {
              end: {character: 5, line: 0},
              start: {character: 5, line: 0}
            }
          }
        ]
      }
    }
  })
})

test('emphasis', async () => {
  await serverHandle.openInMemoryDocument('memory://1', 'mdx', 'Hello\n')
  const editsPromise = new Promise((resolve) => {
    serverHandle.connection.onRequest('workspace/applyEdit', resolve)
  })
  const result = await serverHandle.sendExecuteCommandRequest(
    'mdx.toggleEmphasis',
    [
      'memory://1',
      /** @satisfies {Range} */
      ({end: {character: 3, line: 0}, start: {character: 3, line: 0}})
    ]
  )

  assert.equal(result, null)
  assert.deepEqual(await editsPromise, {
    edit: {
      changes: {
        'memory://1': [
          {
            newText: '*',
            range: {
              end: {character: 0, line: 0},
              start: {character: 0, line: 0}
            }
          },
          {
            newText: '*',
            range: {
              end: {character: 5, line: 0},
              start: {character: 5, line: 0}
            }
          }
        ]
      }
    }
  })
})

test('inlineCode', async () => {
  await serverHandle.openInMemoryDocument('memory://1', 'mdx', 'Hello\n')
  const editsPromise = new Promise((resolve) => {
    serverHandle.connection.onRequest('workspace/applyEdit', resolve)
  })
  const result = await serverHandle.sendExecuteCommandRequest(
    'mdx.toggleInlineCode',
    [
      'memory://1',
      /** @satisfies {Range} */
      ({end: {character: 3, line: 0}, start: {character: 3, line: 0}})
    ]
  )

  assert.equal(result, null)
  assert.deepEqual(await editsPromise, {
    edit: {
      changes: {
        'memory://1': [
          {
            newText: '`',
            range: {
              end: {character: 0, line: 0},
              start: {character: 0, line: 0}
            }
          },
          {
            newText: '`',
            range: {
              end: {character: 5, line: 0},
              start: {character: 5, line: 0}
            }
          }
        ]
      }
    }
  })
})

test('strong', async () => {
  await serverHandle.openInMemoryDocument('memory://1', 'mdx', 'Hello\n')
  const editsPromise = new Promise((resolve) => {
    serverHandle.connection.onRequest('workspace/applyEdit', resolve)
  })
  const result = await serverHandle.sendExecuteCommandRequest(
    'mdx.toggleStrong',
    [
      'memory://1',
      /** @satisfies {Range} */
      ({end: {character: 3, line: 0}, start: {character: 3, line: 0}})
    ]
  )

  assert.equal(result, null)
  assert.deepEqual(await editsPromise, {
    edit: {
      changes: {
        'memory://1': [
          {
            newText: '**',
            range: {
              end: {character: 0, line: 0},
              start: {character: 0, line: 0}
            }
          },
          {
            newText: '**',
            range: {
              end: {character: 5, line: 0},
              start: {character: 5, line: 0}
            }
          }
        ]
      }
    }
  })
})
