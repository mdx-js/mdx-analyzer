/**
 * @typedef {import('@volar/language-core').CodeInformation} CodeInformation
 * @typedef {import('@volar/language-core').LanguagePlugin} LanguagePlugin
 * @typedef {import('@volar/language-core').Mapping<CodeInformation>} Mapping
 * @typedef {import('@volar/language-core').VirtualFile} VirtualFile
 * @typedef {import('estree').ExportDefaultDeclaration} ExportDefaultDeclaration
 * @typedef {import('mdast').Root} Root
 * @typedef {import('mdast').RootContent} RootContent
 * @typedef {import('mdast-util-mdxjs-esm').MdxjsEsm} MdxjsEsm
 * @typedef {import('typescript').IScriptSnapshot} IScriptSnapshot
 * @typedef {import('unified').PluggableList} PluggableList
 * @typedef {import('unified').Processor<Root>} Processor
 *
 * @typedef {Root | RootContent} Node
 */

import remarkMdx from 'remark-mdx'
import remarkParse from 'remark-parse'
import {unified} from 'unified'

/**
 * @param {string} propsName
 */
const layoutJsDoc = (propsName) => `
/** @typedef {MDXContentProps & { children: JSX.Element }} MDXLayoutProps */

/**
 * There is one special component: [MDX layout](https://mdxjs.com/docs/using-mdx/#layout).
 * If it is defined, it’s used to wrap all content.
 * A layout can be defined from within MDX using a default export.
 *
 * @param {{readonly [K in keyof MDXLayoutProps]: MDXLayoutProps[K]}} ${propsName}
 *   The [props](https://mdxjs.com/docs/using-mdx/#props) that have been passed to the MDX component.
 *   In addition, the MDX layout receives the \`children\` prop, which contains the rendered MDX content.
 * @returns {JSX.Element}
 *   The MDX content wrapped in the layout.
 */`

const componentStart = `
/**
 * Render the MDX contents.
 *
 * @param {{readonly [K in keyof MDXContentProps]: MDXContentProps[K]}} props
 *   The [props](https://mdxjs.com/docs/using-mdx/#props) that have been passed to the MDX component.
 */
export default function MDXContent(props) {
  return `
const componentEnd = `
}

// @ts-ignore
/** @typedef {0 extends 1 & Props ? {} : Props} MDXContentProps */
`

const fallback = componentStart + componentEnd

/**
 * Visit an mdast tree with and enter and exit callback.
 *
 * @param {Node} node
 *   The mdast tree to visit.
 * @param {(node: Node) => undefined} onEnter
 *   The callback caled when entering a node.
 * @param {(node: Node) => undefined} onExit
 *   The callback caled when exiting a node.
 */
function visit(node, onEnter, onExit) {
  onEnter(node)
  if ('children' in node) {
    for (const child of node.children) {
      visit(child, onEnter, onExit)
    }
  }

  onExit(node)
}

/**
 * @param {Mapping} mapping
 * @param {number} sourceOffset
 * @param {number} generatedOffset
 * @param {number} length
 */
function addOffset(mapping, sourceOffset, generatedOffset, length) {
  mapping.sourceOffsets.push(sourceOffset)
  mapping.generatedOffsets.push(generatedOffset)
  mapping.lengths.push(length)
}

/**
 * @param {string} haystack
 * @param {string} needle
 * @param {number} start
 */
function findIndexAfter(haystack, needle, start) {
  for (let index = start; index < haystack.length; index++) {
    if (haystack[index] === needle) {
      return index
    }
  }

  return -1
}

/**
 * @param {ExportDefaultDeclaration} node
 */
function getPropsName(node) {
  const {declaration} = node
  const {type} = declaration

  if (
    type !== 'ArrowFunctionExpression' &&
    type !== 'FunctionDeclaration' &&
    type !== 'FunctionExpression'
  ) {
    return
  }

  if (declaration.params.length === 1) {
    const parameter = declaration.params[0]
    if (parameter.type === 'Identifier') {
      return parameter.name
    }
  }

  return 'props'
}

/**
 * Process exports of an MDX ESM node.
 *
 * @param {string} mdx
 *   The full MDX code to process.
 * @param {MdxjsEsm} node
 *   The MDX ESM node to process.
 * @param {Mapping} mapping
 *   The Volar mapping to add offsets to.
 * @param {string} esm
 *   The virtual ESM code up to the point this function was called.
 * @returns {string}
 *   The updated virtual ESM code.
 */
function processExports(mdx, node, mapping, esm) {
  const start = node.position?.start?.offset
  const end = node.position?.end?.offset

  if (start === undefined || end === undefined) {
    return esm
  }

  const body = node.data?.estree?.body

  if (!body?.length) {
    addOffset(mapping, start, esm.length, end - start)
    return esm + mdx.slice(start, end) + '\n'
  }

  for (const child of body) {
    if (child.type === 'ExportDefaultDeclaration') {
      const propsName = getPropsName(child)
      if (propsName) {
        esm += layoutJsDoc(propsName)
      }

      esm += '\nconst MDXLayout = '
      addOffset(
        mapping,
        child.declaration.start,
        esm.length,
        child.end - child.declaration.start
      )
      esm += mdx.slice(child.declaration.start, child.end) + '\n'
      continue
    }

    if (child.type === 'ExportNamedDeclaration' && child.source) {
      const {specifiers} = child
      for (let index = 0; index < specifiers.length; index++) {
        const specifier = specifiers[index]
        if (specifier.local.name === 'default') {
          addOffset(mapping, start, esm.length, specifier.start - start)
          esm += mdx.slice(start, specifier.start)
          const nextPosition =
            index === specifiers.length - 1
              ? specifier.end
              : findIndexAfter(mdx, ',', specifier.end) + 1
          addOffset(mapping, nextPosition, esm.length, end - nextPosition)
          return (
            esm +
            mdx.slice(nextPosition, end) +
            '\nimport {' +
            specifier.exported.name +
            ' as MDXLayout} from ' +
            JSON.stringify(child.source.value)
          )
        }
      }
    }

    addOffset(mapping, child.start, esm.length, child.end - child.start)
    esm += mdx.slice(child.start, child.end) + '\n'
  }

  return esm
}

/**
 * @param {string} fileName
 * @param {IScriptSnapshot} snapshot
 * @param {typeof import('typescript')} ts
 * @param {Processor} processor
 * @returns {VirtualFile[]}
 */
function getVirtualFiles(fileName, snapshot, ts, processor) {
  const mdx = snapshot.getText(0, snapshot.getLength())
  /** @type {Mapping[]} */
  const jsMappings = []
  /** @type {Root} */
  let ast

  try {
    ast = processor.parse(mdx)
  } catch {
    return [
      {
        embeddedFiles: [],
        fileName: fileName + '.jsx',
        languageId: 'javascriptreact',
        typescript: {
          scriptKind: ts.ScriptKind.JSX
        },
        mappings: jsMappings,
        snapshot: ts.ScriptSnapshot.fromString(fallback)
      },
      {
        embeddedFiles: [],
        fileName: fileName + '.md',
        languageId: 'markdown',
        mappings: [],
        snapshot: ts.ScriptSnapshot.fromString(mdx)
      }
    ]
  }

  /**
   * The Volar mapping that maps all ESM syntax of the MDX file to the virtual JavaScript file.
   *
   * @type {Mapping}
   */
  const esmMapping = {
    sourceOffsets: [],
    generatedOffsets: [],
    lengths: [],
    data: {
      completion: true,
      format: false,
      navigation: true,
      semantic: true,
      structure: true,
      verification: true
    }
  }

  /**
   * The Volar mapping that maps all JSX syntax of the MDX file to the virtual JavaScript file.
   *
   * @type {Mapping}
   */
  const jsxMapping = {
    sourceOffsets: [],
    generatedOffsets: [],
    lengths: [],
    data: {
      completion: true,
      format: false,
      navigation: true,
      semantic: true,
      structure: true,
      verification: true
    }
  }

  /**
   * The Volar mapping that maps all markdown content to the virtual markdown file.
   *
   * @type {Mapping}
   */
  const markdownMapping = {
    sourceOffsets: [],
    generatedOffsets: [],
    lengths: [],
    data: {
      completion: true,
      format: false,
      navigation: true,
      semantic: true,
      structure: true,
      verification: true
    }
  }

  /** @type {VirtualFile[]} */
  const virtualFiles = []

  let esm = ''
  let jsx = ''
  let markdown = ''
  let nextMarkdownSourceStart = 0

  /**
   * Update the **markdown** mappings from a start and end offset of a **JavaScript** chunk.
   *
   * @param {number} startOffset
   *   The start offset of the JavaScript chunk.
   * @param {number} endOffset
   *   The end offset of the JavaScript chunk.
   */
  function updateMarkdownFromOffsets(startOffset, endOffset) {
    if (nextMarkdownSourceStart !== startOffset) {
      addOffset(
        markdownMapping,
        nextMarkdownSourceStart,
        markdown.length,
        startOffset - nextMarkdownSourceStart
      )
      markdown += mdx.slice(nextMarkdownSourceStart, startOffset)
      if (startOffset !== endOffset) {
        markdown += '<!---->'
      }
    }

    nextMarkdownSourceStart = endOffset
  }

  /**
   * Update the **markdown** mappings from a start and end offset of a **JavaScript** node.
   *
   * @param {Node} node
   *   The JavaScript node.
   */
  function updateMarkdownFromNode(node) {
    const startOffset = /** @type {number} */ (node.position?.start.offset)
    const endOffset = /** @type {number} */ (node.position?.end.offset)

    updateMarkdownFromOffsets(startOffset, endOffset)
  }

  visit(
    ast,
    (node) => {
      let start = node.position?.start?.offset
      let end = node.position?.end?.offset

      if (start === undefined || end === undefined) {
        return
      }

      switch (node.type) {
        case 'toml':
        case 'yaml': {
          const frontmatterWithFences = mdx.slice(start, end)
          const frontmatterStart = frontmatterWithFences.indexOf(node.value)
          virtualFiles.push({
            embeddedFiles: [],
            fileName: fileName + '.' + node.type,
            languageId: node.type,
            mappings: [
              {
                sourceOffsets: [frontmatterStart],
                generatedOffsets: [0],
                lengths: [node.value.length],
                data: {
                  completion: true,
                  format: true,
                  navigation: true,
                  semantic: true,
                  structure: true,
                  verification: true
                }
              }
            ],
            snapshot: ts.ScriptSnapshot.fromString(node.value)
          })

          break
        }

        case 'mdxjsEsm': {
          updateMarkdownFromNode(node)
          esm = processExports(mdx, node, esmMapping, esm)
          break
        }

        case 'mdxJsxFlowElement':
        case 'mdxJsxTextElement': {
          if (node.children.length > 0) {
            end = /** @type {number} */ (
              node.children[0].position?.start.offset
            )
          }

          updateMarkdownFromOffsets(start, end)
          addOffset(jsxMapping, start, jsx.length, end - start)
          jsx += mdx.slice(start, end)
          break
        }

        case 'mdxFlowExpression':
        case 'mdxTextExpression': {
          updateMarkdownFromNode(node)

          if (node.data?.estree?.body.length === 0) {
            start += 1
            end -= 1

            addOffset(esmMapping, start, esm.length, end - start)
            esm += mdx.slice(start, end) + '\n'
          } else {
            addOffset(jsxMapping, start, jsx.length, end - start)
            jsx += mdx.slice(start, end)
          }

          break
        }

        case 'text': {
          jsx += "{''}"
          break
        }

        default: {
          jsx += '<>'
          break
        }
      }
    },
    (node) => {
      switch (node.type) {
        case 'mdxJsxFlowElement':
        case 'mdxJsxTextElement': {
          const child = node.children?.at(-1)

          if (child) {
            const start = /** @type {number} */ (child.position?.end.offset)
            const end = /** @type {number} */ (node.position?.end.offset)

            updateMarkdownFromOffsets(start, end)
            addOffset(jsxMapping, start, jsx.length, end - start)
            jsx += mdx.slice(start, end)
          }

          break
        }

        case 'mdxTextExpression':
        case 'mdxjsEsm':
        case 'mdxFlowExpression':
        case 'text':
        case 'toml':
        case 'yaml': {
          break
        }

        default: {
          jsx += '</>'
          break
        }
      }
    }
  )

  updateMarkdownFromOffsets(mdx.length, mdx.length)
  esm += componentStart

  for (let i = 0; i < jsxMapping.generatedOffsets.length; i++) {
    jsxMapping.generatedOffsets[i] += esm.length
  }

  esm += jsx + componentEnd

  if (esmMapping.sourceOffsets.length > 0) {
    jsMappings.push(esmMapping)
  }

  if (jsxMapping.sourceOffsets.length > 0) {
    jsMappings.push(jsxMapping)
  }

  virtualFiles.unshift(
    {
      embeddedFiles: [],
      fileName: fileName + '.jsx',
      languageId: 'javascriptreact',
      typescript: {
        scriptKind: ts.ScriptKind.JSX
      },
      mappings: jsMappings,
      snapshot: ts.ScriptSnapshot.fromString(esm)
    },
    {
      embeddedFiles: [],
      fileName: fileName + '.md',
      languageId: 'markdown',
      mappings: [markdownMapping],
      snapshot: ts.ScriptSnapshot.fromString(markdown)
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
    createVirtualFile(fileName, languageId, snapshot) {
      if (languageId !== 'mdx') {
        return
      }

      const length = snapshot.getLength()

      return {
        embeddedFiles: getVirtualFiles(fileName, snapshot, ts, processor),
        fileName,
        languageId: 'mdx',
        mappings: [
          {
            sourceOffsets: [0],
            generatedOffsets: [0],
            lengths: [length],
            data: {
              completion: true,
              format: true,
              navigation: true,
              semantic: true,
              structure: true,
              verification: true
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
            completion: true,
            format: true,
            navigation: true,
            semantic: true,
            structure: true,
            verification: true
          }
        }
      ]

      mdxFile.embeddedFiles = getVirtualFiles(
        mdxFile.fileName,
        snapshot,
        ts,
        processor
      )
    },

    typescript: {
      resolveSourceFileName(tsFileName) {
        if (tsFileName.endsWith('.mdx.jsx')) {
          // .mdx.jsx → .mdx
          return tsFileName.slice(0, -4)
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
