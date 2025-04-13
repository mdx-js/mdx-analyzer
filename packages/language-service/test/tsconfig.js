/**
 * @import {Plugin} from 'unified'
 */

import assert from 'node:assert/strict'
import {test} from 'node:test'
import {resolveRemarkPlugins} from '@mdx-js/language-service'

test('ignore null', () => {
  const result = resolveRemarkPlugins(null, () => () => {})

  assert.equal(result, undefined)
})

test('ignore non-objects', () => {
  const result = resolveRemarkPlugins('string', () => () => {})

  assert.equal(result, undefined)
})

test('ignore objects without `plugins` key', () => {
  const result = resolveRemarkPlugins({}, () => () => {})

  assert.equal(result, undefined)
})

test('ignore null plugins', () => {
  const result = resolveRemarkPlugins({plugins: null}, () => () => {})

  assert.equal(result, undefined)
})

test('ignore non-object plugins', () => {
  const result = resolveRemarkPlugins({plugins: 'string'}, () => () => {})

  assert.equal(result, undefined)
})

test('ignore empty plugins', () => {
  const result = resolveRemarkPlugins({plugins: []}, () => () => {})

  assert.equal(result, undefined)
})

test('load array of plugin tuples', () => {
  /** @type {Record<string, Plugin>} */
  const plugins = {
    a() {},
    b() {}
  }

  const result = resolveRemarkPlugins(
    {plugins: ['a', ['b', 'b options'], 42]},
    (name) => plugins[name]
  )

  assert.deepEqual(result, [[plugins.a], [plugins.b, 'b options']])
})

test('load object plugin mappings', () => {
  /** @type {Record<string, Plugin>} */
  const plugins = {
    a() {},
    b() {}
  }

  const result = resolveRemarkPlugins(
    {plugins: {a: undefined, b: 'b options'}},
    (name) => plugins[name]
  )

  assert.deepEqual(result, [
    [plugins.a, undefined],
    [plugins.b, 'b options']
  ])
})
