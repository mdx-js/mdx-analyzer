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

  const file = module.createVirtualFile('file:///test.mdx', 'mdx', snapshot)

  assert.deepEqual(file, {
    id: 'file:///test.mdx',
    mappings: [
      {
        sourceRange: [0, 35],
        generatedRange: [0, 35],
        data: {}
      }
    ],
    snapshot,
    embeddedFiles: [
      {
        embeddedFiles: [],
        id: 'file:///test.mdx.jsx',
        typescript: {
          scriptKind: 2
        },
        mappings: [
          {
            data: {},
            generatedRange: [0, 34],
            sourceRange: [0, 34]
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
          '  return <>',
          '                                  ',
          '',
          '  </>',
          '}',
          '',
          '// @ts-ignore',
          '/** @typedef {Props} MDXContentProps */',
          ''
        )
      },
      {
        embeddedFiles: [],
        id: 'file:///test.mdx.md',
        mappings: [],
        snapshot: snapshotFromLines('                                  ', '')
      }
    ]
  })
})

test('create virtual file w/ mdxFlowExpression', () => {
  const module = getLanguageModule(typescript)

  const snapshot = snapshotFromLines('{Math.PI}', '')

  const file = module.createVirtualFile('file:///test.mdx', 'mdx', snapshot)

  assert.deepEqual(file, {
    id: 'file:///test.mdx',
    mappings: [
      {
        sourceRange: [0, 10],
        generatedRange: [0, 10],
        data: {}
      }
    ],
    snapshot,
    embeddedFiles: [
      {
        embeddedFiles: [],
        id: 'file:///test.mdx.jsx',
        typescript: {
          scriptKind: 2
        },
        mappings: [
          {
            data: {},
            generatedRange: [199, 208],
            sourceRange: [0, 9]
          }
        ],
        snapshot: snapshotFromLines(
          '         ',
          '',
          '/**',
          ' * Render the MDX contents.',
          ' *',
          ' * @param {MDXContentProps} props',
          ' *   The props that have been passed to the MDX component.',
          ' */',
          'export default function MDXContent(props) {',
          '  return <>',
          '{Math.PI}',
          '',
          '  </>',
          '}',
          '',
          '// @ts-ignore',
          '/** @typedef {Props} MDXContentProps */',
          ''
        )
      },
      {
        embeddedFiles: [],
        id: 'file:///test.mdx.md',
        mappings: [],
        snapshot: snapshotFromLines('         ', '')
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

  const file = module.createVirtualFile('file:///test.mdx', 'mdx', snapshot)

  assert.deepEqual(file, {
    id: 'file:///test.mdx',
    mappings: [
      {
        sourceRange: [0, 66],
        generatedRange: [0, 66],
        data: {}
      }
    ],
    snapshot,
    embeddedFiles: [
      {
        embeddedFiles: [],
        id: 'file:///test.mdx.jsx',
        typescript: {
          scriptKind: 2
        },
        mappings: [
          {
            data: {},
            generatedRange: [255, 264],
            sourceRange: [0, 9]
          },
          {
            data: {},
            generatedRange: [312, 320],
            sourceRange: [57, 65]
          }
        ],
        snapshot: snapshotFromLines(
          '     ',
          '',
          '                                                  ',
          '',
          '      ',
          '',
          '/**',
          ' * Render the MDX contents.',
          ' *',
          ' * @param {MDXContentProps} props',
          ' *   The props that have been passed to the MDX component.',
          ' */',
          'export default function MDXContent(props) {',
          '  return <>',
          '<div>',
          '',
          '                                                  ',
          '',
          '</div>',
          '',
          '  </>',
          '}',
          '',
          '// @ts-ignore',
          '/** @typedef {Props} MDXContentProps */',
          ''
        )
      },
      {
        embeddedFiles: [],
        id: 'file:///test.mdx.md',
        mappings: [
          {
            sourceRange: [9, 59],
            generatedRange: [9, 59],
            data: {}
          }
        ],
        snapshot: snapshotFromLines(
          '     ',
          '',
          '  This content should not be part of the JSX embed',
          '',
          '      ',
          ''
        )
      }
    ]
  })
})

test('create virtual file w/ mdxJsxFlowElement w/o children', () => {
  const module = getLanguageModule(typescript)

  const snapshot = snapshotFromLines('<div />', '')

  const file = module.createVirtualFile('file:///test.mdx', 'mdx', snapshot)

  assert.deepEqual(file, {
    id: 'file:///test.mdx',
    mappings: [
      {
        sourceRange: [0, 8],
        generatedRange: [0, 8],
        data: {}
      }
    ],
    snapshot,
    embeddedFiles: [
      {
        embeddedFiles: [],
        id: 'file:///test.mdx.jsx',
        typescript: {
          scriptKind: 2
        },
        mappings: [
          {
            data: {},
            generatedRange: [197, 204],
            sourceRange: [0, 7]
          }
        ],
        snapshot: snapshotFromLines(
          '       ',
          '',
          '/**',
          ' * Render the MDX contents.',
          ' *',
          ' * @param {MDXContentProps} props',
          ' *   The props that have been passed to the MDX component.',
          ' */',
          'export default function MDXContent(props) {',
          '  return <>',
          '<div />',
          '',
          '  </>',
          '}',
          '',
          '// @ts-ignore',
          '/** @typedef {Props} MDXContentProps */',
          ''
        )
      },
      {
        embeddedFiles: [],
        id: 'file:///test.mdx.md',
        mappings: [],
        snapshot: snapshotFromLines('       ', '')
      }
    ]
  })
})

test('create virtual file w/ mdxJsxTextElement', () => {
  const module = getLanguageModule(typescript)

  const snapshot = snapshotFromLines('A <div />', '')

  const file = module.createVirtualFile('file:///test.mdx', 'mdx', snapshot)

  assert.deepEqual(file, {
    id: 'file:///test.mdx',
    mappings: [
      {
        sourceRange: [0, 10],
        generatedRange: [0, 10],
        data: {}
      }
    ],
    snapshot,
    embeddedFiles: [
      {
        embeddedFiles: [],
        id: 'file:///test.mdx.jsx',
        typescript: {
          scriptKind: 2
        },
        mappings: [
          {
            data: {},
            generatedRange: [201, 208],
            sourceRange: [2, 9]
          }
        ],
        snapshot: snapshotFromLines(
          '         ',
          '',
          '/**',
          ' * Render the MDX contents.',
          ' *',
          ' * @param {MDXContentProps} props',
          ' *   The props that have been passed to the MDX component.',
          ' */',
          'export default function MDXContent(props) {',
          '  return <>',
          '  <div />',
          '',
          '  </>',
          '}',
          '',
          '// @ts-ignore',
          '/** @typedef {Props} MDXContentProps */',
          ''
        )
      },
      {
        embeddedFiles: [],
        id: 'file:///test.mdx.md',
        mappings: [
          {
            sourceRange: [0, 2],
            generatedRange: [0, 2],
            data: {}
          }
        ],
        snapshot: snapshotFromLines('A        ', '')
      }
    ]
  })
})

test('create virtual file w/ mdxTextExpression', () => {
  const module = getLanguageModule(typescript)

  const snapshot = snapshotFromLines('3 < {Math.PI} < 4', '')

  const file = module.createVirtualFile('file:///test.mdx', 'mdx', snapshot)

  assert.deepEqual(file, {
    id: 'file:///test.mdx',
    mappings: [
      {
        sourceRange: [0, 18],
        generatedRange: [0, 18],
        data: {}
      }
    ],
    snapshot,
    embeddedFiles: [
      {
        embeddedFiles: [],
        id: 'file:///test.mdx.jsx',
        typescript: {
          scriptKind: 2
        },
        mappings: [
          {
            data: {},
            generatedRange: [211, 220],
            sourceRange: [4, 13]
          }
        ],
        snapshot: snapshotFromLines(
          '                 ',
          '',
          '/**',
          ' * Render the MDX contents.',
          ' *',
          ' * @param {MDXContentProps} props',
          ' *   The props that have been passed to the MDX component.',
          ' */',
          'export default function MDXContent(props) {',
          '  return <>',
          '    {Math.PI}    ',
          '',
          '  </>',
          '}',
          '',
          '// @ts-ignore',
          '/** @typedef {Props} MDXContentProps */',
          ''
        )
      },
      {
        embeddedFiles: [],
        id: 'file:///test.mdx.md',
        mappings: [
          {
            sourceRange: [0, 4],
            generatedRange: [0, 4],
            data: {}
          },
          {
            sourceRange: [14, 17],
            generatedRange: [14, 17],
            data: {}
          }
        ],
        snapshot: snapshotFromLines('3 <           < 4', '')
      }
    ]
  })
})

test('create virtual file w/ syntax error', () => {
  const module = getLanguageModule(typescript)

  const snapshot = snapshotFromLines('<', '')

  const file = module.createVirtualFile('file:///test.mdx', 'mdx', snapshot)

  assert.deepEqual(file, {
    id: 'file:///test.mdx',
    mappings: [
      {
        sourceRange: [0, 2],
        generatedRange: [0, 2],
        data: {}
      }
    ],
    snapshot,
    embeddedFiles: [
      {
        capabilities: {},
        embeddedFiles: [],
        id: 'file:///test.mdx.jsx',
        typescript: {
          scriptKind: 2
        },
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
          '  return <>',
          '',
          '  </>',
          '}',
          '',
          '// @ts-ignore',
          '/** @typedef {Props} MDXContentProps */',
          ''
        )
      },
      {
        capabilities: {},
        embeddedFiles: [],
        id: 'file:///test.mdx.md',
        mappings: [],
        snapshot: snapshotFromLines('<', '')
      }
    ]
  })
})

test('create virtual file w/ yaml frontmatter', () => {
  const module = getLanguageModule(typescript, [remarkFrontmatter])

  const snapshot = snapshotFromLines('---', 'hello: frontmatter', '---', '')

  const file = module.createVirtualFile('file:///test.mdx', 'mdx', snapshot)

  assert.deepEqual(file, {
    id: 'file:///test.mdx',
    mappings: [
      {
        sourceRange: [0, 27],
        generatedRange: [0, 27],
        data: {}
      }
    ],
    snapshot,
    embeddedFiles: [
      {
        embeddedFiles: [],
        id: 'file:///test.mdx.jsx',
        typescript: {
          scriptKind: 2
        },
        mappings: [],
        snapshot: snapshotFromLines(
          '   ',
          '                  ',
          '   ',
          '',
          '/**',
          ' * Render the MDX contents.',
          ' *',
          ' * @param {MDXContentProps} props',
          ' *   The props that have been passed to the MDX component.',
          ' */',
          'export default function MDXContent(props) {',
          '  return <>',
          '   ',
          '                  ',
          '   ',
          '',
          '  </>',
          '}',
          '',
          '// @ts-ignore',
          '/** @typedef {Props} MDXContentProps */',
          ''
        )
      },
      {
        embeddedFiles: [],
        id: 'file:///test.mdx.md',
        mappings: [
          {
            sourceRange: [0, 26],
            generatedRange: [0, 26],
            data: {}
          }
        ],
        snapshot: snapshotFromLines('---', 'hello: frontmatter', '---', '')
      },
      {
        embeddedFiles: [],
        id: 'file:///test.mdx.yaml',
        mappings: [
          {
            sourceRange: [4, 22],
            generatedRange: [0, 18],
            data: {}
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
    'file:///test.mdx',
    'mdx',
    snapshotFromLines('Tihs lne haz tyops', '')
  )

  const snapshot = snapshotFromLines('This line is fixed', '')
  module.updateVirtualFile(/** @type {VirtualFile} */ (file), snapshot)

  assert.deepEqual(file, {
    id: 'file:///test.mdx',
    mappings: [
      {
        sourceRange: [0, 19],
        generatedRange: [0, 19],
        data: {}
      }
    ],
    snapshot,
    embeddedFiles: [
      {
        embeddedFiles: [],
        id: 'file:///test.mdx.jsx',
        typescript: {
          scriptKind: 2
        },
        mappings: [],
        snapshot: snapshotFromLines(
          '                  ',
          '',
          '/**',
          ' * Render the MDX contents.',
          ' *',
          ' * @param {MDXContentProps} props',
          ' *   The props that have been passed to the MDX component.',
          ' */',
          'export default function MDXContent(props) {',
          '  return <>',
          '                  ',
          '',
          '  </>',
          '}',
          '',
          '// @ts-ignore',
          '/** @typedef {Props} MDXContentProps */',
          ''
        )
      },
      {
        embeddedFiles: [],
        id: 'file:///test.mdx.md',
        mappings: [
          {
            sourceRange: [0, 18],
            generatedRange: [0, 18],
            data: {}
          }
        ],
        snapshot: snapshotFromLines('This line is fixed', '')
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
