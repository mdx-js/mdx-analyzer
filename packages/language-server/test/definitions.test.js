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
      typescript: {enabled: true, tsdk}
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

test('resolve file-local definitions in ESM', async () => {
  const {uri} = await serverHandle.openTextDocument(
    fixturePath('node16/a.mdx'),
    'mdx'
  )
  const result = await serverHandle.sendDefinitionRequest(uri, {
    line: 4,
    character: 3
  })

  assert.deepEqual(result, [
    {
      originSelectionRange: {
        start: {line: 4, character: 2},
        end: {line: 4, character: 3}
      },
      targetRange: {
        start: {line: 1, character: 0},
        end: {line: 1, character: 22}
      },
      targetSelectionRange: {
        start: {line: 1, character: 16},
        end: {line: 1, character: 17}
      },
      targetUri: fixtureUri('node16/a.mdx')
    }
  ])
})

test('resolve cross-file definitions in ESM if the other file was previously opened', async () => {
  await serverHandle.openTextDocument(fixturePath('node16/a.mdx'), 'mdx')
  const {uri} = await serverHandle.openTextDocument(
    fixturePath('node16/b.mdx'),
    'mdx'
  )
  const result = await serverHandle.sendDefinitionRequest(uri, {
    line: 0,
    character: 10
  })

  assert.deepEqual(result, [
    {
      originSelectionRange: {
        start: {line: 0, character: 9},
        end: {line: 0, character: 10}
      },
      targetRange: {
        start: {line: 1, character: 0},
        end: {line: 1, character: 22}
      },
      targetSelectionRange: {
        start: {line: 1, character: 16},
        end: {line: 1, character: 17}
      },
      targetUri: fixtureUri('node16/a.mdx')
    }
  ])
})

test('resolve cross-file definitions in ESM if the other file is unopened', async () => {
  const {uri} = await serverHandle.openTextDocument(
    fixturePath('node16/b.mdx'),
    'mdx'
  )
  const result = await serverHandle.sendDefinitionRequest(uri, {
    line: 0,
    character: 10
  })

  assert.deepEqual(result, [
    {
      originSelectionRange: {
        start: {line: 0, character: 9},
        end: {line: 0, character: 10}
      },
      targetRange: {
        start: {line: 1, character: 0},
        end: {line: 1, character: 22}
      },
      targetSelectionRange: {
        start: {line: 1, character: 16},
        end: {line: 1, character: 17}
      },
      targetUri: fixtureUri('node16/a.mdx')
    }
  ])
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
