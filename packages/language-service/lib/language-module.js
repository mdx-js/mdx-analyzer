/**
 * @typedef {import('@volar/language-core').Language} Language
 * @typedef {import('@volar/language-core').VirtualFile} VirtualFile
 * @typedef {import('mdast').Root} Root
 * @typedef {import('typescript').IScriptSnapshot} IScriptSnapshot
 * @typedef {import('unified').PluggableList} PluggableList
 * @typedef {import('unified').Processor<Root>} Processor
 * @typedef {import('unist').Node} Node
 * @typedef {import('unist').Parent} Parent
 *
 * @typedef {[start: number, end: number]} OffsetRange
 */

import {
  FileKind,
} from '@volar/language-core'
import remarkMdx from 'remark-mdx'
import remarkParse from 'remark-parse'
import {unified} from 'unified'
import {visitParents} from 'unist-util-visit-parents'

const componentStart = `
/**
 * Render the MDX contents.
 *
 * @param {MDXContentProps} props
 *   The props that have been passed to the MDX component.
 */
export default function MDXContent(props) {
  return <>
`
const componentEnd = `
  </>
}

// @ts-ignore
/** @typedef {Props} MDXContentProps */
`

const fallback = componentStart + componentEnd

const whitespaceRegex = /\s/u

/**
 * @param {OffsetRange[]} positions
 * @param {number} index
 * @returns {boolean} XXX
 */
function shouldShow(positions, index) {
  return positions.some(([start, end]) => start <= index && index < end)
}

/**
 * @param {OffsetRange} a
 * @param {OffsetRange} b
 * @returns {number} XXX
 */
function compareRanges(a, b) {
  return a[0] - b[0] || a[1] - b[1]
}

/**
 * @param {Parent} node
 * @returns {number | undefined} XXX
 */
function findFirstOffset(node) {
  for (const child of node.children) {
    const start = child.position?.start?.offset
    if (start !== undefined) {
      return start
    }
  }
}

/**
 * @param {Parent} node
 * @returns {number | undefined} XXX
 */
function findLastOffset(node) {
  for (let index = node.children.length - 1; index >= 0; index--) {
    const end = node.children[index].position?.end?.offset
    if (end !== undefined) {
      return end
    }
  }
}

/**
 * @param {string} fileId
 * @param {IScriptSnapshot} snapshot
 * @param {typeof import('typescript')} ts
 * @param {Processor} processor
 * @returns {VirtualFile[]}
 */
function getVirtualFiles(fileId, snapshot, ts, processor) {
  const mdx = snapshot.getText(0, snapshot.getLength())
  /** @type {VirtualFile['mappings']} */
  const jsxMappings = []
  /** @type {VirtualFile['mappings']} */
  const mdMappings = []
  /** @type {Root} */
  let ast

  try {
    ast = processor.parse(mdx)
  } catch {
    return [
      {
        embeddedFiles: [],
        id: fileId + '.jsx',
        languageId: 'javascriptreact',
        kind: FileKind.TypeScriptHostFile,
        mappings: jsxMappings,
        snapshot: ts.ScriptSnapshot.fromString(fallback)
      },
      {
        embeddedFiles: [],
        id: fileId + '.md',
        languageId: 'markdown',
        kind: FileKind.TypeScriptHostFile,
        mappings: mdMappings,
        snapshot: ts.ScriptSnapshot.fromString(mdx)
      }
    ]
  }

  /** @type {OffsetRange[]} */
  const esmPositions = []
  /** @type {OffsetRange[]} */
  const jsxPositions = []
  /** @type {VirtualFile[]} */
  const virtualFiles = []

  visitParents(ast, (node) => {
    const start = node.position?.start?.offset
    const end = node.position?.end?.offset

    if (start === undefined || end === undefined) {
      return
    }

    switch (node.type) {
      case 'yaml': {
        const frontmatterWithFences = mdx.slice(start, end)
        const frontmatterStart = frontmatterWithFences.indexOf(node.value)
        virtualFiles.push({
          embeddedFiles: [],
          id: fileId + '.yaml',
          languageId: 'yaml',
          kind: FileKind.TypeScriptHostFile,
          mappings: [
            {
              sourceRange: [
                frontmatterStart,
                frontmatterStart + node.value.length
              ],
              generatedRange: [0, node.value.length],
              data: {}
            }
          ],
          snapshot: ts.ScriptSnapshot.fromString(node.value)
        })

        break
      }

      case 'mdxjsEsm': {
        esmPositions.push([start, end])
        break
      }

      case 'mdxJsxFlowElement': {
        const firstOffset = findFirstOffset(node)
        const lastOffset = findLastOffset(node)
        if (firstOffset === undefined || lastOffset === undefined) {
          jsxPositions.push([start, end])
          break
        }

        jsxPositions.push([start, firstOffset], [lastOffset, end])
        break
      }

      case 'mdxFlowExpression':
      case 'mdxTextExpression': {
        jsxPositions.push([start, end])
        if (node.data?.estree?.body.length === 0) {
          esmPositions.push([start + 1, end - 1])
        }

        break
      }

      case 'mdxJsxTextElement': {
        jsxPositions.push([start, end])
        break
      }

      default: {
        break
      }
    }
  })

  esmPositions.sort(compareRanges)
  jsxPositions.sort(compareRanges)
  let esmShadow = ''
  let jsxShadow = ''
  let mdShadow = ''
  /** @type {number | undefined} */
  let mdChunkStart

  // eslint-disable-next-line unicorn/no-for-loop
  for (let index = 0; index < mdx.length; index++) {
    const char = mdx[index]

    if (whitespaceRegex.test(char)) {
      esmShadow += char
      jsxShadow += char
      mdShadow += char
      continue
    }

    const shouldShowEsm = shouldShow(esmPositions, index)
    const shouldShowJsx = shouldShow(jsxPositions, index)
    esmShadow += shouldShowEsm ? char : ' '
    jsxShadow += shouldShowJsx ? char : ' '
    if (shouldShowEsm || shouldShowJsx) {
      mdShadow += ' '
      if (mdChunkStart !== undefined) {
        mdMappings.push({
          sourceRange: [mdChunkStart, index],
          generatedRange: [mdChunkStart, index],
          data: {}
        })
      }

      mdChunkStart = undefined
    } else {
      mdShadow += char
      if (mdChunkStart === undefined) {
        mdChunkStart = index
      }
    }
  }

  if (mdChunkStart !== undefined) {
    mdMappings.push({
      sourceRange: [mdChunkStart, mdx.length - 1],
      generatedRange: [mdChunkStart, mdx.length - 1],
      data: {}
    })
  }

  const jsxStart = esmShadow.length + componentStart.length
  const js = esmShadow + componentStart + jsxShadow + componentEnd

  for (const [start, end] of esmPositions) {
    jsxMappings.push({
      sourceRange: [start, end],
      generatedRange: [start, end],
      data: {}
    })
  }

  for (const [start, end] of jsxPositions) {
    jsxMappings.push({
      sourceRange: [start, end],
      generatedRange: [start + jsxStart, end + jsxStart],
      data: {}
    })
  }

  virtualFiles.unshift(
    {
      embeddedFiles: [],
      id: fileId + '.jsx',
      languageId: 'javascriptreact',
      kind: FileKind.TypeScriptHostFile,
      mappings: jsxMappings,
      snapshot: ts.ScriptSnapshot.fromString(js)
    },
    {
      embeddedFiles: [],
      id: fileId + '.md',
      languageId: 'markdown',
      kind: FileKind.TypeScriptHostFile,
      mappings: mdMappings,
      snapshot: ts.ScriptSnapshot.fromString(mdShadow)
    }
  )

  return virtualFiles
}

/**
 * Create a [Volar](https://volarjs.dev) language module to support MDX.
 *
 * @param {typeof import('typescript')} ts
 *   The TypeScript module.
 * @param {PluggableList} [plugins]
 *   A list of remark syntax plugins. Only syntax plugins are supported.
 *   Transformers are unused.
 * @returns {Language}
 *   A Volar language module to support MDX.
 */
export function getLanguageModule(ts, plugins) {
  const processor = unified().use(remarkParse).use(remarkMdx)
  if (plugins) {
    processor.use(plugins)
  }

  processor.freeze()

  return {
    createVirtualFile(id, languageId, snapshot) {
      if (languageId !== 'mdx') {
        return
      }

      const length = snapshot.getLength()

      return {
        embeddedFiles: getVirtualFiles(id, snapshot, ts, processor),
        id,
        languageId: 'mdx',
        kind: FileKind.TextFile,
        mappings: [
          {
            sourceRange: [0, length],
            generatedRange: [0, length],
            data: {}
          }
        ],
        snapshot
      }
    },

    updateVirtualFile(mdxFile, snapshot) {
      mdxFile.snapshot = snapshot

      const length = snapshot.getLength()
      mdxFile.mappings = [
        {
          sourceRange: [0, length],
          generatedRange: [0, length],
          data: {}
        }
      ]

      mdxFile.embeddedFiles = getVirtualFiles(
        mdxFile.id,
        snapshot,
        ts,
        processor
      )
    },

    typescript: {
      resolveLanguageServiceHost(host) {
        return {
          ...host,
          getCompilationSettings: () => ({
            // Default to the JSX automatic runtime, because that’s what MDX does.
            jsx: ts.JsxEmit.ReactJSX,
            // Set these defaults to match MDX if the user explicitly sets the classic runtime.
            jsxFactory: 'React.createElement',
            jsxFragmentFactory: 'React.Fragment',
            // Set this default to match MDX if the user overrides the import source.
            jsxImportSource: 'react',
            ...host.getCompilationSettings(),
            // Always allow JS for type checking.
            allowJs: true,
            // This internal TypeScript property lets TypeScript load `.mdx` files.
            allowNonTsExtensions: true
          })
        }
      }
    }
  }
}
