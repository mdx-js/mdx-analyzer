#!/usr/bin/env node
import assert from 'node:assert/strict'
import {spawnSync} from 'node:child_process'
import pkg from '../packages/vscode-mdx/package.json' with {type: 'json'}

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
