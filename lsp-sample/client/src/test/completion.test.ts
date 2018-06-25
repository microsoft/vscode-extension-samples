import * as vscode from 'vscode'
import { testCompletion, getDocUri } from './helper'

describe('Should do completion', () => {
  const docUri = getDocUri('completion.txt')

  it('Completes JS/TS in txt file', async () => {
    await testCompletion(docUri, new vscode.Position(0, 0), {
      items: [
        { label: 'JavaScript', kind: vscode.CompletionItemKind.Text },
        { label: 'TypeScript', kind: vscode.CompletionItemKind.Text }
      ]
    })
  })
})
