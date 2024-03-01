/**
 * @typedef {import('@volar/test-utils').LanguageServerHandle} LanguageServerHandle
 */
import assert from 'node:assert/strict'
import {afterEach, beforeEach, test} from 'node:test'
import {createServer, fixturePath, fixtureUri, tsdk} from './utils.js'

/** @type {LanguageServerHandle} */
let serverHandle

beforeEach(async () => {
  serverHandle = createServer()
  // @ts-expect-error https://github.com/volarjs/volar.js/pull/142
  await serverHandle.initialize(fixtureUri('no-tsconfig'), {
    typescript: {enabled: true, tsdk}
  })
})

afterEach(() => {
  serverHandle.connection.dispose()
})

test('no tsconfig exists', async () => {
  const {uri} = await serverHandle.openTextDocument(
    fixturePath('no-tsconfig/readme.mdx'),
    'mdx'
  )
  const diagnostics = await serverHandle.sendDocumentDiagnosticRequest(uri)

  assert.deepEqual(diagnostics, {
    items: [],
    kind: 'full'
  })
})
