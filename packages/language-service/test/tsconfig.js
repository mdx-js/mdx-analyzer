/**
 * @import {Plugin} from 'unified'
 */

import assert from 'node:assert/strict'
import {test} from 'node:test'
import {resolveRemarkPlugins} from '@mdx-js/language-service'

test('ignore null', async () => {
  const result = await resolveRemarkPlugins(null, () => () => {})

  assert.equal(result, undefined)
})

test('ignore non-objects', async () => {
  const result = await resolveRemarkPlugins('string', () => () => {})

  assert.equal(result, undefined)
})

test('ignore objects without `plugins` key', async () => {
  const result = await resolveRemarkPlugins({}, () => () => {})

  assert.equal(result, undefined)
})

test('ignore null plugins', async () => {
  const result = await resolveRemarkPlugins({plugins: null}, () => () => {})

  assert.equal(result, undefined)
})

test('ignore non-object plugins', async () => {
  const result = await resolveRemarkPlugins({plugins: 'string'}, () => () => {})

  assert.equal(result, undefined)
})

test('ignore empty plugins', async () => {
  const result = await resolveRemarkPlugins({plugins: []}, () => () => {})

  assert.equal(result, undefined)
})

test('load array of plugin tuples', async () => {
  /** @type {Record<string, Plugin>} */
  const plugins = {
    a() {},
    b() {}
  }

  const result = await resolveRemarkPlugins(
    {plugins: ['a', ['b', 'b options'], 42]},
    (name) => plugins[name]
  )

  assert.deepEqual(result, [[plugins.a], [plugins.b, 'b options']])
})

test('load object plugin mappings', async () => {
  /** @type {Record<string, Plugin>} */
  const plugins = {
    a() {},
    b() {}
  }

  const result = await resolveRemarkPlugins(
    {plugins: {a: undefined, b: 'b options'}},
    (name) => plugins[name]
  )

  assert.deepEqual(result, [
    [plugins.a, undefined],
    [plugins.b, 'b options']
  ])
})
