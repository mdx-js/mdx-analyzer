/**
 * @typedef {import('@volar/language-service').CodeMapping} CodeMapping
 * @typedef {import('@volar/language-service').VirtualCode} VirtualCode
 * @typedef {import('estree').ExportDefaultDeclaration} ExportDefaultDeclaration
 * @typedef {import('estree').Program} Program
 * @typedef {import('mdast').Nodes} Nodes
 * @typedef {import('mdast').Root} Root
 * @typedef {import('mdast-util-mdxjs-esm').MdxjsEsm} MdxjsEsm
 * @typedef {import('typescript').IScriptSnapshot} IScriptSnapshot
 * @typedef {import('unified').Processor<Root>} Processor
 * @typedef {import('vfile-message').VFileMessage} VFileMessage
 */

import {walk} from 'estree-walker'
import {analyze} from 'periscopic'
import {getNodeEndOffset, getNodeStartOffset} from './mdast-utils.js'
import {ScriptSnapshot} from './script-snapshot.js'
import {isInjectableComponent} from './jsx-utils.js'

/**
 * Render the content that should be prefixed to the embedded JavaScript file.
 *
 * @param {boolean} tsCheck
 *   If true, insert a `@check-js` comment into the virtual JavaScript code.
 * @param {string} jsxImportSource
 *   The string to use for the JSX import source tag.
 */
const jsPrefix = (
  tsCheck,
  jsxImportSource
) => `${tsCheck ? '// @ts-check\n' : ''}/* @jsxRuntime automatic
@jsxImportSource ${jsxImportSource} */
`

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

/**
 * @param {boolean} isAsync
 *   Whether or not the `_createMdxContent` should be async
 * @param {string[]} variables
 */
const componentStart = (isAsync, variables) => `
/**
 * @internal
 *   **Do not use.** This function is generated by MDX for internal use.
 *
 * @param {{readonly [K in keyof MDXContentProps]: MDXContentProps[K]}} props
 *   The [props](https://mdxjs.com/docs/using-mdx/#props) that have been passed to the MDX component.
 */
${isAsync ? 'async ' : ''}function _createMdxContent(props) {
  /**
   * @internal
   *   **Do not use.** This variable is generated by MDX for internal use.
   */
  const _components = {
    // @ts-ignore
    .../** @type {0 extends 1 & MDXProvidedComponents ? {} : MDXProvidedComponents} */ ({}),
    ...props.components,
    /** The [props](https://mdxjs.com/docs/using-mdx/#props) that have been passed to the MDX component. */
    props${Array.from(variables, (name) => ',\n    /** {@link ' + name + '} */\n    ' + name).join('')}
  }
  _components
  return <>`

const componentEnd = `
  </>
}

/**
 * Render the MDX contents.
 *
 * @param {{readonly [K in keyof MDXContentProps]: MDXContentProps[K]}} props
 *   The [props](https://mdxjs.com/docs/using-mdx/#props) that have been passed to the MDX component.
 */
export default function MDXContent(props) {
  return <_createMdxContent {...props} />
}

// @ts-ignore
/** @typedef {(0 extends 1 & Props ? {} : Props) & {components?: {}}} MDXContentProps */
`

const jsxIndent = '\n    '

const fallback =
  jsPrefix(false, 'react') + componentStart(false, []) + componentEnd

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
 * @param {CodeMapping} mapping
 *   The Volar mapping to append the offsets to.
 * @param {string} source
 *   The original source code.
 * @param {string} generated
 *   The generated content so far.
 * @param {number} startOffset
 *   The start offset in the original source code.
 * @param {number} endOffset
 *   The end offset in the original source code.
 * @param {boolean} [includeNewline]
 *  If true, and the source range is followed directly by a newline, extend the
 *  end offset to include that newline.
 * @returns {string}
 *   The updated generated content.
 */
function addOffset(
  mapping,
  source,
  generated,
  startOffset,
  endOffset,
  includeNewline
) {
  if (startOffset === endOffset) {
    return generated
  }

  if (includeNewline) {
    const LF = 10
    const CR = 13
    // eslint-disable-next-line unicorn/prefer-code-point
    const charCode = source.charCodeAt(endOffset)
    if (charCode === LF) {
      endOffset += 1
    }
    // eslint-disable-next-line unicorn/prefer-code-point
    else if (charCode === CR && source.charCodeAt(endOffset + 1) === LF) {
      endOffset += 2
    }
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
 * @param {CodeMapping} mapping
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
    return addOffset(mapping, mdx, esm, start, end, true)
  }

  for (const child of body) {
    if (child.type === 'ExportDefaultDeclaration') {
      const propsName = getPropsName(child)
      if (propsName) {
        esm += layoutJsDoc(propsName)
      }

      esm = addOffset(
        mapping,
        mdx,
        esm + '\nconst MDXLayout = ',
        child.declaration.start,
        child.end,
        true
      )
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
            addOffset(mapping, mdx, esm, nextPosition, end, true) +
            '\nimport {' +
            specifier.exported.name +
            ' as MDXLayout} from ' +
            JSON.stringify(child.source.value) +
            '\n'
          )
        }
      }
    }

    esm = addOffset(mapping, mdx, esm, child.start, child.end, true)
  }

  return esm + '\n'
}

/**
 * @param {string} mdx
 * @param {Root} ast
 * @param {boolean} checkMdx
 * @param {string} jsxImportSource
 * @returns {VirtualCode[]}
 */
function getEmbeddedCodes(mdx, ast, checkMdx, jsxImportSource) {
  /** @type {CodeMapping[]} */
  const jsMappings = []

  /**
   * The Volar mapping that maps all ESM syntax of the MDX file to the virtual JavaScript file.
   *
   * @type {CodeMapping}
   */
  const esmMapping = {
    sourceOffsets: [],
    generatedOffsets: [],
    lengths: [],
    data: {
      completion: true,
      format: true,
      navigation: true,
      semantic: true,
      structure: true,
      verification: true
    }
  }

  /**
   * The Volar mapping that maps all JSX syntax of the MDX file to the virtual JavaScript file.
   *
   * @type {CodeMapping}
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
   * @type {CodeMapping}
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

  /** @type {VirtualCode[]} */
  const virtualCodes = []

  let hasAwait = false
  let esm = jsPrefix(checkMdx, jsxImportSource)
  let jsx = ''
  let markdown = ''
  let nextMarkdownSourceStart = 0

  /** @type {Program} */
  const esmProgram = {
    type: 'Program',
    sourceType: 'module',
    start: 0,
    end: 0,
    body: []
  }

  for (const child of ast.children) {
    if (child.type !== 'mdxjsEsm') {
      continue
    }

    const estree = child.data?.estree

    if (estree) {
      esmProgram.body.push(...estree.body)
    }
  }

  const variables = [...analyze(esmProgram).scope.declarations.keys()].sort()

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
    const startOffset = getNodeStartOffset(node)
    const endOffset = getNodeEndOffset(node)

    updateMarkdownFromOffsets(startOffset, endOffset)
  }

  /**
   * @param {Program} program
   * @param {number} lastIndex
   * @returns {number}
   */
  function processJsxExpression(program, lastIndex) {
    let newIndex = lastIndex
    let functionNesting = 0
    walk(program, {
      enter(node) {
        switch (node.type) {
          case 'JSXIdentifier': {
            if (!isInjectableComponent(node.name, variables)) {
              return
            }

            jsx =
              addOffset(jsxMapping, mdx, jsx, newIndex, node.start) +
              '_components.'
            newIndex = node.start
            break
          }

          case 'ArrowFunctionExpression':
          case 'FunctionDeclaration':
          case 'FunctionExpression': {
            functionNesting++
            break
          }

          case 'AwaitExpression': {
            if (!functionNesting) {
              hasAwait = true
            }

            break
          }

          case 'ForOfStatement': {
            if (!functionNesting) {
              hasAwait ||= node.await
            }

            break
          }

          default:
        }
      },

      leave(node) {
        switch (node.type) {
          case 'ArrowFunctionExpression':
          case 'FunctionDeclaration':
          case 'FunctionExpression': {
            functionNesting--
            break
          }

          default:
        }
      }
    })

    return newIndex
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
          virtualCodes.push({
            id: node.type,
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
            end = mdx.lastIndexOf('>', getNodeStartOffset(node.children[0])) + 1
          }

          updateMarkdownFromOffsets(start, end)

          let lastIndex = start + 1
          jsx = addOffset(jsxMapping, mdx, jsx + jsxIndent, start, lastIndex)
          if (isInjectableComponent(node.name, variables)) {
            jsx += '_components.'
          }

          if (node.name) {
            jsx = addOffset(
              jsxMapping,
              mdx,
              jsx,
              lastIndex,
              lastIndex + node.name.length
            )
            lastIndex += node.name.length
          }

          for (const attribute of node.attributes) {
            if (typeof attribute.value !== 'object') {
              continue
            }

            const program = attribute.value?.data?.estree

            if (program) {
              lastIndex = processJsxExpression(program, lastIndex)
            }
          }

          jsx = addOffset(jsxMapping, mdx, jsx, lastIndex, end)
          break
        }

        case 'mdxFlowExpression':
        case 'mdxTextExpression': {
          updateMarkdownFromNode(node)
          const program = node.data?.estree
          jsx += jsxIndent

          if (program?.body.length) {
            const newIndex = processJsxExpression(program, start)
            jsx = addOffset(jsxMapping, mdx, jsx, newIndex, end)
          } else {
            jsx = addOffset(jsxMapping, mdx, jsx, start, start + 1)
            jsx = addOffset(jsxMapping, mdx, jsx, end - 1, end)
            esm = addOffset(esmMapping, mdx, esm, start + 1, end - 1) + '\n'
          }

          break
        }

        case 'root': {
          break
        }

        case 'text': {
          jsx += jsxIndent + "{''}"
          break
        }

        default: {
          jsx += jsxIndent + '<>'
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
            const start = mdx.indexOf('<', getNodeEndOffset(child) - 1)
            const end = getNodeEndOffset(node)

            updateMarkdownFromOffsets(start, end)
            if (isInjectableComponent(node.name, variables)) {
              const closingStart = start + 2
              jsx = addOffset(
                jsxMapping,
                mdx,
                addOffset(
                  jsxMapping,
                  mdx,
                  jsx + jsxIndent,
                  start,
                  closingStart
                ) + '_components.',
                closingStart,
                end
              )
            } else {
              jsx = addOffset(jsxMapping, mdx, jsx + jsxIndent, start, end)
            }
          }

          break
        }

        case 'mdxTextExpression':
        case 'mdxjsEsm':
        case 'mdxFlowExpression':
        case 'root':
        case 'text':
        case 'toml':
        case 'yaml': {
          break
        }

        default: {
          jsx += jsxIndent + '</>'
          break
        }
      }
    }
  )

  updateMarkdownFromOffsets(mdx.length, mdx.length)
  esm += componentStart(hasAwait, variables)

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

  virtualCodes.unshift(
    {
      id: 'jsx',
      languageId: 'javascriptreact',
      mappings: jsMappings,
      snapshot: new ScriptSnapshot(esm)
    },
    {
      id: 'md',
      languageId: 'markdown',
      mappings: [markdownMapping],
      snapshot: new ScriptSnapshot(markdown)
    }
  )

  return virtualCodes
}

/**
 * A Volar virtual code that contains some additional metadata for MDX files.
 */
export class VirtualMdxCode {
  #processor
  #checkMdx
  #jsxImportSource

  /**
   * The mdast of the document, but only if it’s valid.
   *
   * @type {Root | undefined}
   */
  ast

  /**
   * The virtual files embedded in the MDX file.
   *
   * @type {VirtualCode[]}
   */
  embeddedCodes = []

  /**
   * The error that was throw while parsing.
   *
   * @type {VFileMessage | undefined}
   */
  error

  /**
   * The file ID.
   *
   * @type {'mdx'}
   */
  id = 'mdx'

  /**
   * The language ID.
   *
   * @type {'mdx'}
   */
  languageId = 'mdx'

  /**
   * The code mappings of the MDX file. There is always only one mapping.
   *
   * @type {CodeMapping[]}
   */
  mappings = []

  /**
   * @param {IScriptSnapshot} snapshot
   *   The original TypeScript snapshot.
   * @param {Processor} processor
   *   The unified processor to use for parsing.
   * @param {boolean} checkMdx
   *   If true, insert a `@check-js` comment into the virtual JavaScript code.
   * @param {string} jsxImportSource
   *   The JSX import source to use in the embedded JavaScript file.
   */
  constructor(snapshot, processor, checkMdx, jsxImportSource) {
    this.#processor = processor
    this.#checkMdx = checkMdx
    this.#jsxImportSource = jsxImportSource
    this.snapshot = snapshot
    this.update(snapshot)
  }

  /**
   * Update the virtual file when it has changed.
   *
   * @param {IScriptSnapshot} snapshot
   *   The new TypeScript snapshot.
   * @returns {undefined}
   */
  update(snapshot) {
    this.snapshot = snapshot
    const length = snapshot.getLength()
    this.mappings[0] = {
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

    const mdx = snapshot.getText(0, length)

    try {
      const ast = this.#processor.parse(mdx)
      this.embeddedCodes = getEmbeddedCodes(
        mdx,
        ast,
        this.#checkMdx,
        this.#jsxImportSource
      )
      this.ast = ast
      this.error = undefined
    } catch (error) {
      this.error = /** @type {VFileMessage} */ (error)
      this.ast = undefined
      this.embeddedCodes = [
        {
          id: 'jsx',
          languageId: 'javascriptreact',
          mappings: [],
          snapshot: new ScriptSnapshot(fallback)
        },
        {
          id: 'md',
          languageId: 'markdown',
          mappings: [],
          snapshot: new ScriptSnapshot(mdx)
        }
      ]
    }
  }
}
