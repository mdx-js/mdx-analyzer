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
  await serverHandle.initialize(
    fixtureUri('node16'),
    {
      typescript: {tsdk}
    },
    {
      textDocument: {
        definition: {
          linkSupport: true
        }
      }
    }
  )
})

afterEach(() => {
  serverHandle.connection.dispose()
})

test('does not resolve shadow content', async () => {
  const {uri} = await serverHandle.openTextDocument(
    fixturePath('node16/undefined-props.mdx'),
    'mdx'
  )
  const result = await serverHandle.sendDefinitionRequest(uri, {
    line: 0,
    character: 37
  })

  assert.deepEqual(result, [])
})

test('ignore non-existent mdx files', async () => {
  const uri = fixtureUri('node16/non-existent.mdx')
  const result = await serverHandle.sendDefinitionRequest(uri, {
    line: 7,
    character: 15
  })

  assert.deepEqual(result, [])
})
