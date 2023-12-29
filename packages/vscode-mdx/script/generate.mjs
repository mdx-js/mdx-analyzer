#!/usr/bin/env node
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'

const repo = 'wooorm/markdown-tm-language'
const branch = 'main'
const filename = 'source.mdx.tmLanguage'

const branchesResponse = await fetch(
  `https://api.github.com/repos/${repo}/branches`
)

const branches =
  /** @type {Array<{name: string, commit: {sha: string, url: string}, protected: boolean}>} */ (
    await branchesResponse.json()
  )
const main = branches.find((d) => d.name === branch)
assert(main, 'expected `' + branch + '` branch')

const sha = main.commit.sha

const blobResponse = await fetch(
  `https://raw.githubusercontent.com/${repo}/${branch}/${filename}`
)
let blob = await blobResponse.text()

let injected = false

blob = blob.replace(/<dict>/, ($0) => {
  injected = true
  return `<!--
    This file is maintained at <https://github.com/${repo}/blob/${branch}/${filename}>.
    To improve it, please create a pull request to the original repository.
    Once accepted there, it can be pulled into this project (\`vscode-mdx\`) with
    \`script/generate.mjs\`, and released.

    Version from SHA: ${sha}.
  -->
  ${$0}`
})

assert(injected, 'expected to find a dict')

await fs.writeFile(
  new URL('../syntaxes/source.mdx.tmLanguage', import.meta.url),
  blob
)

console.log('Wrote `source.mdx.tmLanguage` at `' + sha + '`')
