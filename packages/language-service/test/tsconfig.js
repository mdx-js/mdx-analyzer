/**
 * @import {Plugin} from 'unified'
 */

import assert from 'node:assert/strict'
import {test} from 'node:test'
import {resolvePlugins} from '@mdx-js/language-service'

test('ignore null', () => {
  const result = resolvePlugins(null, () => () => {})

  assert.deepEqual(result, [])
})

test('ignore non-objects', () => {
  const result = resolvePlugins('string', () => () => {})

  assert.deepEqual(result, [])
})

test('ignore objects without `plugins` key', () => {
  const result = resolvePlugins({}, () => () => {})

  assert.deepEqual(result, [])
})

test('ignore null plugins', () => {
  const result = resolvePlugins({plugins: null}, () => () => {})

  assert.deepEqual(result, [])
})

test('ignore non-object plugins', () => {
  const result = resolvePlugins({plugins: 'string'}, () => () => {})

  assert.deepEqual(result, [])
})

test('ignore empty plugins', () => {
  const result = resolvePlugins({plugins: []}, () => () => {})

  assert.deepEqual(result, [])
})

test('load array of plugin tuples', () => {
  /** @type {Record<string, Plugin>} */
  const plugins = {
    a() {},
    b() {}
  }

  const result = resolvePlugins(
    {plugins: ['a', ['b', 'b options'], 42]},
    (name) => plugins[name]
  )

  assert.deepEqual(result, [[[plugins.a], [plugins.b, 'b options']], []])
})

test('load object plugin mappings', () => {
  /** @type {Record<string, Plugin>} */
  const plugins = {
    a() {},
    b() {}
  }

  const result = resolvePlugins(
    {plugins: {a: [], b: 'b options'}},
    (name) => plugins[name]
  )

  assert.deepEqual(result, [
    [
      [plugins.a, []],
      [plugins.b, 'b options']
    ],
    []
  ])
})
