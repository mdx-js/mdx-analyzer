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
