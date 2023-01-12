import {expect} from '@playwright/test'
import {test} from 'playwright-monaco'

test('ESM hover', async ({editor, page}) => {
  await editor.open('*.mdx', {
    cwd: new URL('../../../fixtures/node16', import.meta.url)
  })
  await editor.setModel('file:///a.mdx')
  await editor.setPosition({lineNumber: 2, column: 10})
  await editor.trigger('editor.action.showHover')

  await expect(page.locator('.monaco-hover-content')).toHaveText(
    'function a(): voidDescription of a'
  )
})

test('JSX hover', async ({editor, page}) => {
  await editor.open('*.mdx', {
    cwd: new URL('../../../fixtures/node16', import.meta.url)
  })
  await editor.setModel('file:///a.mdx')
  await editor.setPosition({lineNumber: 12, column: 2})
  await editor.trigger('editor.action.showHover')

  await expect(page.locator('.monaco-hover-content')).toHaveText(
    'function a(): voidDescription of a'
  )
})
