import * as vscode from 'vscode'
import * as path from 'path'
import * as assert from 'assert'

export let doc: vscode.TextDocument
export let editor: vscode.TextEditor
export let documentEol: string
export let platformEol: string

export async function activate(docUri: vscode.Uri) {
  const ext = vscode.extensions.getExtension('vscode.lsp-sample')
  await ext.activate();
  try {
    doc = await vscode.workspace.openTextDocument(docUri)
    editor = await vscode.window.showTextDocument(doc)
    await sleep(2000) // Wait for server activation
  } catch (e) {
    console.error(e)
  }
}

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export const getDocPath = (p: string) => {
  return path.resolve(__dirname, '../../testFixture', p)
}
export const getDocUri = (p: string) => {
  return vscode.Uri.file(getDocPath(p))
}

export async function setTestContent(content: string): Promise<boolean> {
  const all = new vscode.Range(doc.positionAt(0), doc.positionAt(doc.getText().length))
  return editor.edit(eb => eb.replace(all, content))
}

export async function testCompletion(docUri: vscode.Uri, position: vscode.Position, expectedCompletionList: vscode.CompletionList) {
  await activate(docUri)

  const result = (await vscode.commands.executeCommand(
    'vscode.executeCompletionItemProvider',
    docUri,
    position
  )) as vscode.CompletionList

  assert.equal(result.items.length, expectedCompletionList.items.length);
  expectedCompletionList.items.forEach((expectedItem, i) => {
    const resulItem = result.items[i]
    assert.equal(resulItem.label, expectedItem.label)
    assert.equal(resulItem.kind, expectedItem.kind)
  })
} 