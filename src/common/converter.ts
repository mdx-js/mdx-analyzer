import type * as ts from 'typescript/lib/tsserverlibrary'
import * as vscode from 'vscode-languageserver'

export function tsTextSpanToVSCodeRange(
  span: ts.TextSpan,
  offsetToPosition: (offset: number) => vscode.Position,
): vscode.Range {
  return vscode.Range.create(
    offsetToPosition(span.start + 1),
    offsetToPosition(span.start + 1 + span.length),
  )
}
