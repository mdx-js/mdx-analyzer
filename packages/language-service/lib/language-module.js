/**
 * @typedef {import('@volar/language-core').LanguagePlugin} LanguagePlugin
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

import remarkMdx from 'remark-mdx'
import remarkParse from 'remark-parse'
import { unified } from 'unified'
import { visitParents } from 'unist-util-visit-parents'

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
        typescript: {
          scriptKind: ts.ScriptKind.JSX,
        },
        mappings: jsxMappings,
        snapshot: ts.ScriptSnapshot.fromString(fallback)
      },
      {
        embeddedFiles: [],
        id: fileId + '.md',
        languageId: 'markdown',
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
          mappings: [
            {
              sourceOffsets: [frontmatterStart],
              generatedOffsets: [0],
              lengths: [node.value.length],
              data: {
                verification: true,
                completion: true,
                semantic: true,
                navigation: true,
                structure: true,
                format: true,
              }
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
          sourceOffsets: [mdChunkStart],
          generatedOffsets: [mdChunkStart],
          lengths: [index - mdChunkStart],
          data: {
            verification: true,
            completion: true,
            semantic: true,
            navigation: true,
            structure: true,
            format: true,
          }
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
      sourceOffsets: [mdChunkStart],
      generatedOffsets: [mdChunkStart],
      lengths: [mdx.length - 1 - mdChunkStart],
      data: {
        verification: true,
        completion: true,
        semantic: true,
        navigation: true,
        structure: true,
        format: true,
      }
    })
  }

  const jsxStart = esmShadow.length + componentStart.length
  const js = esmShadow + componentStart + jsxShadow + componentEnd

  for (const [start, end] of esmPositions) {
    jsxMappings.push({
      sourceOffsets: [start],
      generatedOffsets: [start],
      lengths: [end - start],
      data: {
        verification: true,
        completion: true,
        semantic: true,
        navigation: true,
        structure: true,
        format: true,
      }
    })
  }

  for (const [start, end] of jsxPositions) {
    jsxMappings.push({
      sourceOffsets: [start],
      generatedOffsets: [start + jsxStart],
      lengths: [end - start],
      data: {
        verification: true,
        completion: true,
        semantic: true,
        navigation: true,
        structure: true,
        format: true,
      }
    })
  }

  virtualFiles.unshift(
    {
      embeddedFiles: [],
      id: fileId + '.jsx',
      languageId: 'javascriptreact',
      typescript: {
        scriptKind: ts.ScriptKind.JSX,
      },
      mappings: jsxMappings,
      snapshot: ts.ScriptSnapshot.fromString(js)
    },
    {
      embeddedFiles: [],
      id: fileId + '.md',
      languageId: 'markdown',
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
 * @returns {LanguagePlugin}
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
        mappings: [
          {
            sourceOffsets: [0],
            generatedOffsets: [0],
            lengths: [length],
            data: {
              verification: true,
              completion: true,
              semantic: true,
              navigation: true,
              structure: true,
              format: true,
            }
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
          sourceOffsets: [0],
          generatedOffsets: [0],
          lengths: [length],
          data: {
            verification: true,
            completion: true,
            semantic: true,
            navigation: true,
            structure: true,
            format: true,
          }
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
      resolveSourceFileName(tsFileName) {
        if (tsFileName.endsWith('.mdx.tsx')) {
          // .mdx.tsx -> .mdx
          return tsFileName = tsFileName.slice(0, -'.tsx'.length);
        }
      },
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
