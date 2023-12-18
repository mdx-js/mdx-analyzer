/**
 * @typedef {import('@volar/language-core').CodeInformation} CodeInformation
 * @typedef {import('@volar/language-core').Mapping<CodeInformation>} Mapping
 * @typedef {import('@volar/language-core').VirtualFile} VirtualFile
 * @typedef {import('estree').ExportDefaultDeclaration} ExportDefaultDeclaration
 * @typedef {import('mdast').Nodes} Nodes
 * @typedef {import('mdast').Root} Root
 * @typedef {import('mdast-util-mdxjs-esm').MdxjsEsm} MdxjsEsm
 * @typedef {import('typescript').IScriptSnapshot} IScriptSnapshot
 * @typedef {import('unified').Processor<Root>} Processor
 */

import {ScriptSnapshot} from './script-snapshot.js'

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
 * @param {Nodes} node
 *   The mdast tree to visit.
 * @param {(node: Nodes) => undefined} onEnter
 *   The callback caled when entering a node.
 * @param {(node: Nodes) => undefined} onExit
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
 * Generate mapped virtual content based on a source string and start and end offsets.
 *
 * @param {Mapping} mapping
 *   The Volar mapping to append the offsets to.
 * @param {string} source
 *   The original source code.
 * @param {string} generated
 *   The generated content so far.
 * @param {number} startOffset
 *   The start offset in the original source code.
 * @param {number} endOffset
 *   The end offset in the original source code.
 * @returns {string}
 *   The updated generated content.
 */
function addOffset(mapping, source, generated, startOffset, endOffset) {
  if (startOffset === endOffset) {
    return generated
  }

  const length = endOffset - startOffset
  const previousSourceOffset = mapping.sourceOffsets.at(-1)
  const previousGeneratedOffset = mapping.generatedOffsets.at(-1)
  const previousLength = mapping.lengths.at(-1)
  if (
    previousSourceOffset !== undefined &&
    previousGeneratedOffset !== undefined &&
    previousLength !== undefined &&
    previousSourceOffset + previousLength === startOffset &&
    previousGeneratedOffset + previousLength === generated.length
  ) {
    mapping.lengths[mapping.lengths.length - 1] += length
  } else {
    mapping.sourceOffsets.push(startOffset)
    mapping.generatedOffsets.push(generated.length)
    mapping.lengths.push(length)
  }

  return generated + source.slice(startOffset, endOffset)
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
    return addOffset(mapping, mdx, esm, start, end) + '\n'
  }

  for (const child of body) {
    if (child.type === 'ExportDefaultDeclaration') {
      const propsName = getPropsName(child)
      if (propsName) {
        esm += layoutJsDoc(propsName)
      }

      esm =
        addOffset(
          mapping,
          mdx,
          esm + '\nconst MDXLayout = ',
          child.declaration.start,
          child.end
        ) + '\n'
      continue
    }

    if (child.type === 'ExportNamedDeclaration' && child.source) {
      const {specifiers} = child
      for (let index = 0; index < specifiers.length; index++) {
        const specifier = specifiers[index]
        if (specifier.local.name === 'default') {
          esm = addOffset(mapping, mdx, esm, start, specifier.start)
          const nextPosition =
            index === specifiers.length - 1
              ? specifier.end
              : mdx.indexOf(',', specifier.end) + 1
          return (
            addOffset(mapping, mdx, esm, nextPosition, end) +
            '\nimport {' +
            specifier.exported.name +
            ' as MDXLayout} from ' +
            JSON.stringify(child.source.value)
          )
        }
      }
    }

    esm = addOffset(mapping, mdx, esm, child.start, child.end) + '\n'
  }

  return esm
}

/**
 * @param {string} fileName
 * @param {IScriptSnapshot} snapshot
 * @param {Processor} processor
 * @returns {VirtualFile[]}
 */
export function getVirtualFiles(fileName, snapshot, processor) {
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
          scriptKind: 2
        },
        mappings: jsMappings,
        snapshot: new ScriptSnapshot(fallback)
      },
      {
        embeddedFiles: [],
        fileName: fileName + '.md',
        languageId: 'markdown',
        mappings: [],
        snapshot: new ScriptSnapshot(mdx)
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
      const slice = mdx.slice(nextMarkdownSourceStart, startOffset)
      for (const match of slice.matchAll(/^[\t ]*(.*\r?\n?)/gm)) {
        if (match.index === undefined) {
          continue
        }

        const [line, lineContent] = match
        if (line.length === 0) {
          continue
        }

        const lineEnd = nextMarkdownSourceStart + match.index + line.length
        let lineStart = lineEnd - lineContent.length
        if (
          match.index === 0 &&
          nextMarkdownSourceStart !== 0 &&
          mdx[lineStart - 1] !== '\n'
        ) {
          lineStart = nextMarkdownSourceStart + match.index
        }

        markdown = addOffset(markdownMapping, mdx, markdown, lineStart, lineEnd)
      }

      if (startOffset !== endOffset) {
        markdown += '<!---->'
      }
    }

    nextMarkdownSourceStart = endOffset
  }

  /**
   * Update the **markdown** mappings from a start and end offset of a **JavaScript** node.
   *
   * @param {Nodes} node
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
      const start = node.position?.start?.offset
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
            snapshot: new ScriptSnapshot(node.value)
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
          jsx = addOffset(jsxMapping, mdx, jsx, start, end)
          break
        }

        case 'mdxFlowExpression':
        case 'mdxTextExpression': {
          updateMarkdownFromNode(node)

          if (node.data?.estree?.body.length === 0) {
            jsx = addOffset(jsxMapping, mdx, jsx, start, start + 1)
            jsx = addOffset(jsxMapping, mdx, jsx, end - 1, end)
            esm = addOffset(esmMapping, mdx, esm, start + 1, end - 1) + '\n'
          } else {
            jsx = addOffset(jsxMapping, mdx, jsx, start, end)
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
            jsx = addOffset(jsxMapping, mdx, jsx, start, end)
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
        scriptKind: 2
      },
      mappings: jsMappings,
      snapshot: new ScriptSnapshot(esm)
    },
    {
      embeddedFiles: [],
      fileName: fileName + '.md',
      languageId: 'markdown',
      mappings: [markdownMapping],
      snapshot: new ScriptSnapshot(markdown)
    }
  )

  return virtualFiles
}
