import * as visit from 'unist-util-visit'
import * as mdx from '@mdx-js/mdx'
import type { Node } from 'unist'
import MagicString, { Bundle } from 'magic-string'

function isJsxNode(node: Node): boolean {
  return node.type === 'jsx'
}

function isImportNode(node: Node): boolean {
  return node.type === 'import'
}

function isExportNode(node: Node): boolean {
  return node.type === 'export'
}

function getNodeStartOffset(node: Node) {
  return node.position?.start.offset ?? 0
}

function getNodeEndOffset(node: Node) {
  return node.position?.end.offset ?? 0
}

interface Options {
  source?: string
}

export function convert(mdxText: string, options: Options = {}) {
  const source = options.source ?? 'dummy.ts'

  const compiler = mdx.createMdxAstCompiler({ remarkPlugins: [] })
  const tree = compiler.parse({
    contents: mdxText,
  })

  const importNodes: Node[] = []
  visit(tree, isImportNode as any, node => {
    importNodes.push(node)
  })

  const exportNodes: Node[] = []
  visit(tree, isExportNode as any, node => {
    exportNodes.push(node)
  })

  const jsxNodes: Node[] = []
  visit(tree, isJsxNode as any, node => {
    jsxNodes.push(node)
  })

  const visitedNodes: Node[] = [...importNodes, ...exportNodes, ...jsxNodes]
  const visitedNodeSet = new Set(visitedNodes)
  const othersNodes: Node[] = []
  visit(tree, node => {
    if (node !== tree && !visitedNodeSet.has(node)) {
      othersNodes.push(node)
    }
  })

  const bundle = new Bundle()
  const ms = new MagicString(mdxText)
  bundle.addSource({
    filename: source,
    content: ms,
  })

  transformImportAndExportNodes(ms, importNodes, exportNodes)
  transformJsx(ms, jsxNodes)
  transformOthers(ms, othersNodes)

  return {
    code: bundle.toString(),
    map: bundle.generateMap({ hires: true, source, includeContent: true }),
  }
}

function transformImportAndExportNodes(
  ms: MagicString,
  imports: Node[],
  exports: Node[],
) {
  for (const node of imports.concat(exports)) {
    const start = getNodeStartOffset(node)
    const end = getNodeEndOffset(node)
    if (start !== 0) {
      ms.appendLeft(end, '\n')
      ms.move(start, end, 0)
    }
  }
}

const jsxPrefix = `export default function (props: Props) {\n  return (\n    <>\n      `
const jsxPostfix = `\n    </>\n  )\n}`

function transformJsx(ms: MagicString, jsx: Node[]) {
  const last = ms.original.length
  ms.prependLeft(last, jsxPrefix)

  for (const node of jsx) {
    const start = getNodeStartOffset(node)
    const end = getNodeEndOffset(node)
    ms.appendLeft(end, '\n')
    ms.move(start, end, last)
  }
  ms.appendRight(last, jsxPostfix)
}

function transformOthers(ms: MagicString, others: Node[]) {
  for (const node of others) {
    const start = getNodeStartOffset(node)
    const end = getNodeEndOffset(node)
    ms.remove(start, end)
  }
}
