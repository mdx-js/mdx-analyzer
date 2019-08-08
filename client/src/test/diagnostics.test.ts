/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

import * as assert from 'assert'

import { getDocUri, activate } from './helper'

import * as vscode from 'vscode'

function toRange(sLine: number, sChar: number, eLine: number, eChar: number) {
  const start = new vscode.Position(sLine, sChar)
  const end = new vscode.Position(eLine, eChar)
  return new vscode.Range(start, end)
}

async function testDiagnostics(
  docUri: vscode.Uri,
  expectedDiagnostics: vscode.Diagnostic[],
) {
  await activate(docUri)

  const actualDiagnostics = vscode.languages.getDiagnostics(docUri)

  assert.strictEqual(actualDiagnostics.length, expectedDiagnostics.length)

  expectedDiagnostics.forEach((expectedDiagnostic, i) => {
    const actualDiagnostic = actualDiagnostics[i]
    assert.strictEqual(actualDiagnostic.message, expectedDiagnostic.message)
    assert.deepStrictEqual(actualDiagnostic.range, expectedDiagnostic.range)
    assert.strictEqual(actualDiagnostic.severity, expectedDiagnostic.severity)
  })
}

describe('Should get diagnostics', () => {
  const docUri = getDocUri('diagnostics.txt')

  it('Diagnoses uppercase texts', async () => {
    await testDiagnostics(docUri, [
      {
        message: 'ANY is all uppercase.',
        range: toRange(0, 0, 0, 3),
        severity: vscode.DiagnosticSeverity.Warning,
        source: 'ex',
      },
      {
        message: 'ANY is all uppercase.',
        range: toRange(0, 14, 0, 17),
        severity: vscode.DiagnosticSeverity.Warning,
        source: 'ex',
      },
      {
        message: 'OS is all uppercase.',
        range: toRange(0, 18, 0, 20),
        severity: vscode.DiagnosticSeverity.Warning,
        source: 'ex',
      },
    ])
  })
})
