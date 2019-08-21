/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

import assert from 'assert'

import vscode from 'vscode'

import { getDocUri, activate } from './helper'

async function testCompletion(
  docUri: vscode.Uri,
  position: vscode.Position,
  expectedCompletionList: vscode.CompletionList,
) {
  await activate(docUri)

  // Executing the command `vscode.executeCompletionItemProvider` to simulate triggering completion
  const actualCompletionList = (await vscode.commands.executeCommand(
    'vscode.executeCompletionItemProvider',
    docUri,
    position,
  )) as vscode.CompletionList

  assert.strictEqual(
    actualCompletionList.items.length,
    expectedCompletionList.items.length,
  )
  expectedCompletionList.items.forEach((expectedItem, i) => {
    const actualItem = actualCompletionList.items[i]
    assert.strictEqual(actualItem.label, expectedItem.label)
    assert.strictEqual(actualItem.kind, expectedItem.kind)
  })
}

describe('Should do completion', () => {
  const docUri = getDocUri('completion.txt')

  // eslint-disable-next-line jest/expect-expect
  it('Completes JS/TS in txt file', () =>
    testCompletion(docUri, new vscode.Position(0, 0), {
      items: [
        { label: 'JavaScript', kind: vscode.CompletionItemKind.Text },
        { label: 'TypeScript', kind: vscode.CompletionItemKind.Text },
      ],
    }))
})
