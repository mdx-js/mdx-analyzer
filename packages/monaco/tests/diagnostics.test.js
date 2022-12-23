import {expect} from '@playwright/test'
import {test} from 'playwright-monaco'

test('syntax errors', async ({editor}) => {
  const result = await editor.waitForMarkers('file:///a.mdx', async () => {
    await editor.createModel('<\n', 'file:///a.mdx')
  })
  expect(result).toStrictEqual([
    {
      code: 'MDX',
      endColumn: 1,
      endLineNumber: 2,
      message:
        'Unexpected end of file before name, expected a character that can start a name, such as a letter, `$`, or `_`',
      owner: 'mdx',
      relatedInformation: [],
      resource: 'file:///a.mdx',
      severity: 8,
      source: undefined,
      startColumn: 2,
      startLineNumber: 1,
      tags: []
    }
  ])
})

test('ESM errors', async ({editor}) => {
  const result = await editor.waitForMarkers('file:///a.mdx', async () => {
    await editor.createModel(
      'export const foo = /** @type {boolean} */ (42)',
      'file:///a.mdx'
    )
  })
  expect(result).toStrictEqual([
    {
      code: '6133',
      endColumn: 6,
      endLineNumber: 1,
      message: "'props' is declared but its value is never read.",
      owner: 'mdx',
      relatedInformation: [],
      resource: 'file:///a.mdx',
      severity: 1,
      source: undefined,
      startColumn: 1,
      startLineNumber: 1,
      tags: [1]
    }
  ])
})

test('JSX errors', async ({editor}) => {
  const result = await editor.waitForMarkers('file:///a.mdx', async () => {
    await editor.createModel('{/** @type {boolean} */ (42)}', 'file:///a.mdx')
  })
  expect(result).toStrictEqual([
    {
      code: '6133',
      endColumn: 6,
      endLineNumber: 1,
      message: "'props' is declared but its value is never read.",
      owner: 'mdx',
      relatedInformation: [],
      resource: 'file:///a.mdx',
      severity: 1,
      source: undefined,
      startColumn: 1,
      startLineNumber: 1,
      tags: [1]
    }
  ])
})
