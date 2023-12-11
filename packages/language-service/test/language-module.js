/**
 * @typedef {import('@volar/language-core').VirtualFile} VirtualFile
 */

import assert from 'node:assert/strict'
import {test} from 'node:test'
import remarkFrontmatter from 'remark-frontmatter'
import typescript from 'typescript'
import {getLanguageModule} from '@mdx-js/language-service'

test('create virtual file w/ mdxjsEsm', () => {
  const module = getLanguageModule(typescript)

  const snapshot = snapshotFromLines('import {Planet} from "./Planet.js"', '')

  const file = module.createVirtualFile('/test.mdx', 'mdx', snapshot)

  assert.deepEqual(file, {
    fileName: '/test.mdx',
    languageId: 'mdx',
    mappings: [
      {
        sourceOffsets: [0],
        generatedOffsets: [0],
        lengths: [35],
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
    snapshot,
    embeddedFiles: [
      {
        embeddedFiles: [],
        fileName: '/test.mdx.jsx',
        languageId: 'javascriptreact',
        typescript: {
          scriptKind: 2
        },
        mappings: [
          {
            sourceOffsets: [0],
            generatedOffsets: [0],
            lengths: [34],
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
        snapshot: snapshotFromLines(
          'import {Planet} from "./Planet.js"',
          '',
          '/**',
          ' * Render the MDX contents.',
          ' *',
          ' * @param {MDXContentProps} props',
          ' *   The props that have been passed to the MDX component.',
          ' */',
          'export default function MDXContent(props) {',
          '  return <></>',
          '}',
          '',
          '// @ts-ignore',
          '/** @typedef {Props} MDXContentProps */',
          ''
        )
      },
      {
        embeddedFiles: [],
        fileName: '/test.mdx.md',
        languageId: 'markdown',
        mappings: [
          {
            sourceOffsets: [34],
            generatedOffsets: [0],
            lengths: [1],
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
        snapshot: snapshotFromLines('', '<!---->')
      }
    ]
  })
})

test('create virtual file w/ mdxFlowExpression', () => {
  const module = getLanguageModule(typescript)

  const snapshot = snapshotFromLines('{Math.PI}', '')

  const file = module.createVirtualFile('/test.mdx', 'mdx', snapshot)

  assert.deepEqual(file, {
    fileName: '/test.mdx',
    languageId: 'mdx',
    mappings: [
      {
        sourceOffsets: [0],
        generatedOffsets: [0],
        lengths: [10],
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
    snapshot,
    embeddedFiles: [
      {
        embeddedFiles: [],
        fileName: '/test.mdx.jsx',
        languageId: 'javascriptreact',
        typescript: {
          scriptKind: 2
        },
        mappings: [
          {
            sourceOffsets: [0],
            generatedOffsets: [188],
            lengths: [9],
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
        snapshot: snapshotFromLines(
          '',
          '/**',
          ' * Render the MDX contents.',
          ' *',
          ' * @param {MDXContentProps} props',
          ' *   The props that have been passed to the MDX component.',
          ' */',
          'export default function MDXContent(props) {',
          '  return <>{Math.PI}</>',
          '}',
          '',
          '// @ts-ignore',
          '/** @typedef {Props} MDXContentProps */',
          ''
        )
      },
      {
        embeddedFiles: [],
        fileName: '/test.mdx.md',
        languageId: 'markdown',
        mappings: [
          {
            sourceOffsets: [9],
            generatedOffsets: [0],
            lengths: [1],
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
        snapshot: snapshotFromLines('', '<!---->')
      }
    ]
  })
})

test('create virtual file w/ mdxJsxFlowElement w/ children', () => {
  const module = getLanguageModule(typescript)

  const snapshot = snapshotFromLines(
    '<div>',
    '',
    '  This content should not be part of the JSX embed',
    '',
    '</div>',
    ''
  )

  const file = module.createVirtualFile('/test.mdx', 'mdx', snapshot)

  assert.deepEqual(file, {
    fileName: '/test.mdx',
    languageId: 'mdx',
    mappings: [
      {
        sourceOffsets: [0],
        generatedOffsets: [0],
        lengths: [66],
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
    snapshot,
    embeddedFiles: [
      {
        embeddedFiles: [],
        fileName: '/test.mdx.jsx',
        languageId: 'javascriptreact',
        typescript: {
          scriptKind: 2
        },
        mappings: [
          {
            sourceOffsets: [0, 57],
            generatedOffsets: [188, 206],
            lengths: [9, 8],
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
        snapshot: snapshotFromLines(
          '',
          '/**',
          ' * Render the MDX contents.',
          ' *',
          ' * @param {MDXContentProps} props',
          ' *   The props that have been passed to the MDX component.',
          ' */',
          'export default function MDXContent(props) {',
          '  return <><div>',
          '',
          "  <>{''}</>",
          '',
          '</div></>',
          '}',
          '',
          '// @ts-ignore',
          '/** @typedef {Props} MDXContentProps */',
          ''
        )
      },
      {
        embeddedFiles: [],
        fileName: '/test.mdx.md',
        languageId: 'markdown',
        mappings: [
          {
            sourceOffsets: [9, 65],
            generatedOffsets: [0, 55],
            lengths: [48, 1],
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
        snapshot: snapshotFromLines(
          'This content should not be part of the JSX embed<!---->',
          '<!---->'
        )
      }
    ]
  })
})

test('create virtual file w/ mdxJsxFlowElement w/o children', () => {
  const module = getLanguageModule(typescript)

  const snapshot = snapshotFromLines('<div />', '')

  const file = module.createVirtualFile('/test.mdx', 'mdx', snapshot)

  assert.deepEqual(file, {
    fileName: '/test.mdx',
    languageId: 'mdx',
    mappings: [
      {
        sourceOffsets: [0],
        generatedOffsets: [0],
        lengths: [8],
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
    snapshot,
    embeddedFiles: [
      {
        embeddedFiles: [],
        fileName: '/test.mdx.jsx',
        languageId: 'javascriptreact',
        mappings: [
          {
            sourceOffsets: [0],
            generatedOffsets: [188],
            lengths: [7],
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
        snapshot: snapshotFromLines(
          '',
          '/**',
          ' * Render the MDX contents.',
          ' *',
          ' * @param {MDXContentProps} props',
          ' *   The props that have been passed to the MDX component.',
          ' */',
          'export default function MDXContent(props) {',
          '  return <><div /></>',
          '}',
          '',
          '// @ts-ignore',
          '/** @typedef {Props} MDXContentProps */',
          ''
        ),
        typescript: {
          scriptKind: 2
        }
      },
      {
        embeddedFiles: [],
        fileName: '/test.mdx.md',
        languageId: 'markdown',
        mappings: [
          {
            sourceOffsets: [7],
            generatedOffsets: [0],
            lengths: [1],
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
        snapshot: snapshotFromLines('', '<!---->')
      }
    ]
  })
})

test('create virtual file w/ mdxJsxTextElement', () => {
  const module = getLanguageModule(typescript)

  const snapshot = snapshotFromLines('A <div />', '')

  const file = module.createVirtualFile('/test.mdx', 'mdx', snapshot)

  assert.deepEqual(file, {
    fileName: '/test.mdx',
    languageId: 'mdx',
    mappings: [
      {
        sourceOffsets: [0],
        generatedOffsets: [0],
        lengths: [10],
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
    snapshot,
    embeddedFiles: [
      {
        embeddedFiles: [],
        fileName: '/test.mdx.jsx',
        languageId: 'javascriptreact',
        typescript: {
          scriptKind: 2
        },
        mappings: [
          {
            sourceOffsets: [2],
            generatedOffsets: [194],
            lengths: [7],
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
        snapshot: snapshotFromLines(
          '',
          '/**',
          ' * Render the MDX contents.',
          ' *',
          ' * @param {MDXContentProps} props',
          ' *   The props that have been passed to the MDX component.',
          ' */',
          'export default function MDXContent(props) {',
          "  return <><>{''}<div /></></>",
          '}',
          '',
          '// @ts-ignore',
          '/** @typedef {Props} MDXContentProps */',
          ''
        )
      },
      {
        embeddedFiles: [],
        fileName: '/test.mdx.md',
        languageId: 'markdown',
        mappings: [
          {
            sourceOffsets: [0, 9],
            generatedOffsets: [0, 9],
            lengths: [2, 1],
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
        snapshot: snapshotFromLines('A <!---->', '<!---->')
      }
    ]
  })
})

test('create virtual file w/ mdxTextExpression', () => {
  const module = getLanguageModule(typescript)

  const snapshot = snapshotFromLines('3 < {Math.PI} < 4', '')

  const file = module.createVirtualFile('/test.mdx', 'mdx', snapshot)

  assert.deepEqual(file, {
    fileName: '/test.mdx',
    languageId: 'mdx',
    mappings: [
      {
        sourceOffsets: [0],
        generatedOffsets: [0],
        lengths: [18],
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
    snapshot,
    embeddedFiles: [
      {
        embeddedFiles: [],
        fileName: '/test.mdx.jsx',
        languageId: 'javascriptreact',
        typescript: {
          scriptKind: 2
        },
        mappings: [
          {
            generatedOffsets: [194],
            sourceOffsets: [4],
            lengths: [9],
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
        snapshot: snapshotFromLines(
          '',
          '/**',
          ' * Render the MDX contents.',
          ' *',
          ' * @param {MDXContentProps} props',
          ' *   The props that have been passed to the MDX component.',
          ' */',
          'export default function MDXContent(props) {',
          "  return <><>{''}{Math.PI}{''}</></>",
          '}',
          '',
          '// @ts-ignore',
          '/** @typedef {Props} MDXContentProps */',
          ''
        )
      },
      {
        embeddedFiles: [],
        fileName: '/test.mdx.md',
        languageId: 'markdown',
        mappings: [
          {
            sourceOffsets: [0, 13],
            generatedOffsets: [0, 11],
            lengths: [4, 5],
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
        snapshot: snapshotFromLines('3 < <!----> < 4', '<!---->')
      }
    ]
  })
})

test('create virtual file w/ syntax error', () => {
  const module = getLanguageModule(typescript)

  const snapshot = snapshotFromLines('<', '')

  const file = module.createVirtualFile('/test.mdx', 'mdx', snapshot)

  assert.deepEqual(file, {
    fileName: '/test.mdx',
    languageId: 'mdx',
    mappings: [
      {
        sourceOffsets: [0],
        generatedOffsets: [0],
        lengths: [2],
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
    snapshot,
    embeddedFiles: [
      {
        embeddedFiles: [],
        fileName: '/test.mdx.jsx',
        languageId: 'javascriptreact',
        mappings: [],
        snapshot: snapshotFromLines(
          '',
          '/**',
          ' * Render the MDX contents.',
          ' *',
          ' * @param {MDXContentProps} props',
          ' *   The props that have been passed to the MDX component.',
          ' */',
          'export default function MDXContent(props) {',
          '  return ',
          '}',
          '',
          '// @ts-ignore',
          '/** @typedef {Props} MDXContentProps */',
          ''
        ),
        typescript: {
          scriptKind: 2
        }
      },
      {
        embeddedFiles: [],
        fileName: '/test.mdx.md',
        languageId: 'markdown',
        mappings: [],
        snapshot: snapshotFromLines('<', '')
      }
    ]
  })
})

test('create virtual file w/ yaml frontmatter', () => {
  const module = getLanguageModule(typescript, [remarkFrontmatter])

  const snapshot = snapshotFromLines('---', 'hello: frontmatter', '---', '')

  const file = module.createVirtualFile('/test.mdx', 'mdx', snapshot)

  assert.deepEqual(file, {
    fileName: '/test.mdx',
    languageId: 'mdx',
    mappings: [
      {
        sourceOffsets: [0],
        generatedOffsets: [0],
        lengths: [27],
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
    snapshot,
    embeddedFiles: [
      {
        embeddedFiles: [],
        fileName: '/test.mdx.jsx',
        languageId: 'javascriptreact',
        mappings: [],
        snapshot: snapshotFromLines(
          '',
          '/**',
          ' * Render the MDX contents.',
          ' *',
          ' * @param {MDXContentProps} props',
          ' *   The props that have been passed to the MDX component.',
          ' */',
          'export default function MDXContent(props) {',
          '  return <></>',
          '}',
          '',
          '// @ts-ignore',
          '/** @typedef {Props} MDXContentProps */',
          ''
        ),
        typescript: {
          scriptKind: 2
        }
      },
      {
        embeddedFiles: [],
        fileName: '/test.mdx.md',
        languageId: 'markdown',
        mappings: [
          {
            sourceOffsets: [0],
            generatedOffsets: [0],
            lengths: [27],
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
        snapshot: snapshotFromLines(
          '---',
          'hello: frontmatter',
          '---',
          '<!---->'
        )
      },
      {
        embeddedFiles: [],
        fileName: '/test.mdx.yaml',
        languageId: 'yaml',
        mappings: [
          {
            sourceOffsets: [4],
            generatedOffsets: [0],
            lengths: [18],
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
        snapshot: snapshotFromLines('hello: frontmatter')
      }
    ]
  })
})

test('update virtual file', () => {
  const module = getLanguageModule(typescript)

  const file = module.createVirtualFile(
    '/test.mdx',
    'mdx',
    snapshotFromLines('Tihs lne haz tyops', '')
  )

  const snapshot = snapshotFromLines('This line is fixed', '')
  module.updateVirtualFile(/** @type {VirtualFile} */ (file), snapshot)

  assert.deepEqual(file, {
    fileName: '/test.mdx',
    languageId: 'mdx',
    mappings: [
      {
        sourceOffsets: [0],
        generatedOffsets: [0],
        lengths: [19],
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
    snapshot,
    embeddedFiles: [
      {
        embeddedFiles: [],
        fileName: '/test.mdx.jsx',
        languageId: 'javascriptreact',
        mappings: [],
        snapshot: snapshotFromLines(
          '',
          '/**',
          ' * Render the MDX contents.',
          ' *',
          ' * @param {MDXContentProps} props',
          ' *   The props that have been passed to the MDX component.',
          ' */',
          'export default function MDXContent(props) {',
          "  return <><>{''}</></>",
          '}',
          '',
          '// @ts-ignore',
          '/** @typedef {Props} MDXContentProps */',
          ''
        ),
        typescript: {
          scriptKind: 2
        }
      },
      {
        embeddedFiles: [],
        fileName: '/test.mdx.md',
        languageId: 'markdown',
        mappings: [
          {
            sourceOffsets: [0],
            generatedOffsets: [0],
            lengths: [19],
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
        snapshot: snapshotFromLines('This line is fixed', '<!---->')
      }
    ]
  })
})

test('compilation setting defaults', () => {
  const module = getLanguageModule(typescript)

  // @ts-expect-error
  const host = module.typescript?.resolveLanguageServiceHost?.({
    getCompilationSettings: () => ({})
  })

  const compilerOptions = host?.getCompilationSettings()

  assert.deepEqual(compilerOptions, {
    allowJs: true,
    allowNonTsExtensions: true,
    jsx: typescript.JsxEmit.ReactJSX,
    jsxFactory: 'React.createElement',
    jsxFragmentFactory: 'React.Fragment',
    jsxImportSource: 'react'
  })
})

test('compilation setting overrides', () => {
  const module = getLanguageModule(typescript)

  // @ts-expect-error
  const host = module.typescript?.resolveLanguageServiceHost?.({
    getCompilationSettings: () => ({
      jsx: typescript.JsxEmit.React,
      jsxFactory: 'h',
      jsxFragmentFactory: 'Fragment',
      jsxImportSource: 'preact',
      allowJs: false,
      allowNonTsExtensions: false
    })
  })

  const compilerOptions = host?.getCompilationSettings()

  assert.deepEqual(compilerOptions, {
    allowJs: true,
    allowNonTsExtensions: true,
    jsx: typescript.JsxEmit.React,
    jsxFactory: 'h',
    jsxFragmentFactory: 'Fragment',
    jsxImportSource: 'preact'
  })
})

/**
 * @param {string[]} lines
 * @returns {typescript.IScriptSnapshot}
 */
function snapshotFromLines(...lines) {
  return typescript.ScriptSnapshot.fromString(lines.join('\n'))
}
