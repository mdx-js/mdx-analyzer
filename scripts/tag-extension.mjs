#!/usr/bin/env node
import assert from 'node:assert/strict'
import {spawnSync} from 'node:child_process'
// eslint-disable-next-line import/order
import {createRequire} from 'node:module'

const require = createRequire(import.meta.url)
const pkg = require('../packages/vscode-mdx/package.json')

const tag = `${pkg.name}@${pkg.version}`

const {status, stdout, error} = spawnSync('git', [
  'ls-remote',
  pkg.repository.url,
  tag
])

assert.equal(status, 0, error)

const exists = String(stdout).trim() !== ''

if (!exists) {
  console.log(`\nNew tag: ${tag}`)
}
