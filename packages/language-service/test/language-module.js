/**
 * @typedef {import('@volar/language-service').VirtualFile} VirtualFile
 */

import assert from 'node:assert/strict'
import {test} from 'node:test'
import {createMdxLanguagePlugin} from '@mdx-js/language-service'
import remarkFrontmatter from 'remark-frontmatter'
import typescript from 'typescript'
import {VFileMessage} from 'vfile-message'
import {ScriptSnapshot} from '../lib/script-snapshot.js'
import {VirtualMdxFile} from '../lib/virtual-file.js'

test('create virtual file w/ mdxjsEsm', () => {
  const plugin = createMdxLanguagePlugin()

  const snapshot = snapshotFromLines('import {Planet} from "./Planet.js"', '')

  const file = plugin.createVirtualFile('/test.mdx', 'mdx', snapshot)

  assert.ok(file instanceof VirtualMdxFile)
  assert.equal(file.fileName, '/test.mdx')
  assert.equal(file.languageId, 'mdx')
  assert.ifError(file.error)
  assert.equal(file.snapshot, snapshot)
  assert.deepEqual(file.mappings, [
    {
      sourceOffsets: [0],
      generatedOffsets: [0],
      lengths: [snapshot.getLength()],
      data: {
        completion: true,
        format: true,
        navigation: true,
        semantic: true,
        structure: true,
        verification: true
      }
    }
  ])
  assert.deepEqual(file.embeddedFiles, [
    {
      embeddedFiles: [],
      fileName: '/test.mdx.jsx',
      languageId: 'javascriptreact',
      mappings: [
        {
          sourceOffsets: [0],
          generatedOffsets: [51],
          lengths: [34],
          data: {
            completion: true,
            format: false,
            navigation: true,
            semantic: true,
            structure: true,
            verification: true
          }
        }
      ],
      snapshot: snapshotFromLines(
        '/* @jsxRuntime automatic',
        '@jsxImportSource react */',
        'import {Planet} from "./Planet.js"',
        '',
        '/**',
        ' * @deprecated',
        ' *   Do not use.',
        ' *',
        ' * @param {{readonly [K in keyof MDXContentProps]: MDXContentProps[K]}} props',
        ' *   The [props](https://mdxjs.com/docs/using-mdx/#props) that have been passed to the MDX component.',
        ' */',
        'function _createMdxContent(props) {',
        '  return <></>',
        '}',
        '',
        '/**',
        ' * Render the MDX contents.',
        ' *',
        ' * @param {{readonly [K in keyof MDXContentProps]: MDXContentProps[K]}} props',
        ' *   The [props](https://mdxjs.com/docs/using-mdx/#props) that have been passed to the MDX component.',
        ' */',
        'export default function MDXContent(props) {',
        '  return <_createMdxContent {...props} />',
        '}',
        '',
        '// @ts-ignore',
        '/** @typedef {0 extends 1 & Props ? {} : Props} MDXContentProps */',
        ''
      ),
      typescript: {
        scriptKind: typescript.ScriptKind.JSX
      }
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
            format: false,
            navigation: true,
            semantic: true,
            structure: true,
            verification: true
          }
        }
      ],
      snapshot: snapshotFromLines('', '')
    }
  ])
})

test('create virtual file w/o MDX layout in case of named re-export', () => {
  const plugin = createMdxLanguagePlugin()

  const snapshot = snapshotFromLines('export {named} from "./Layout.js"', '')

  const file = plugin.createVirtualFile('/test.mdx', 'mdx', snapshot)

  assert.ok(file instanceof VirtualMdxFile)
  assert.equal(file.fileName, '/test.mdx')
  assert.equal(file.languageId, 'mdx')
  assert.ifError(file.error)
  assert.equal(file.snapshot, snapshot)
  assert.deepEqual(file.mappings, [
    {
      sourceOffsets: [0],
      generatedOffsets: [0],
      lengths: [snapshot.getLength()],
      data: {
        completion: true,
        format: true,
        navigation: true,
        semantic: true,
        structure: true,
        verification: true
      }
    }
  ])
  assert.deepEqual(file.embeddedFiles, [
    {
      embeddedFiles: [],
      fileName: '/test.mdx.jsx',
      languageId: 'javascriptreact',
      mappings: [
        {
          sourceOffsets: [0],
          generatedOffsets: [51],
          lengths: [33],
          data: {
            completion: true,
            format: false,
            navigation: true,
            semantic: true,
            structure: true,
            verification: true
          }
        }
      ],
      snapshot: snapshotFromLines(
        '/* @jsxRuntime automatic',
        '@jsxImportSource react */',
        'export {named} from "./Layout.js"',
        '',
        '/**',
        ' * @deprecated',
        ' *   Do not use.',
        ' *',
        ' * @param {{readonly [K in keyof MDXContentProps]: MDXContentProps[K]}} props',
        ' *   The [props](https://mdxjs.com/docs/using-mdx/#props) that have been passed to the MDX component.',
        ' */',
        'function _createMdxContent(props) {',
        '  return <></>',
        '}',
        '',
        '/**',
        ' * Render the MDX contents.',
        ' *',
        ' * @param {{readonly [K in keyof MDXContentProps]: MDXContentProps[K]}} props',
        ' *   The [props](https://mdxjs.com/docs/using-mdx/#props) that have been passed to the MDX component.',
        ' */',
        'export default function MDXContent(props) {',
        '  return <_createMdxContent {...props} />',
        '}',
        '',
        '// @ts-ignore',
        '/** @typedef {0 extends 1 & Props ? {} : Props} MDXContentProps */',
        ''
      ),
      typescript: {
        scriptKind: typescript.ScriptKind.JSX
      }
    },
    {
      embeddedFiles: [],
      fileName: '/test.mdx.md',
      languageId: 'markdown',
      mappings: [
        {
          sourceOffsets: [33],
          generatedOffsets: [0],
          lengths: [1],
          data: {
            completion: true,
            format: false,
            navigation: true,
            semantic: true,
            structure: true,
            verification: true
          }
        }
      ],
      snapshot: snapshotFromLines('', '')
    }
  ])
})

test('create virtual file w/ MDX layout in case of default re-export', () => {
  const plugin = createMdxLanguagePlugin()

  const snapshot = snapshotFromLines('export {default} from "./Layout.js"', '')

  const file = plugin.createVirtualFile('/test.mdx', 'mdx', snapshot)

  assert.ok(file instanceof VirtualMdxFile)
  assert.equal(file.fileName, '/test.mdx')
  assert.equal(file.languageId, 'mdx')
  assert.ifError(file.error)
  assert.equal(file.snapshot, snapshot)
  assert.deepEqual(file.mappings, [
    {
      sourceOffsets: [0],
      generatedOffsets: [0],
      lengths: [snapshot.getLength()],
      data: {
        completion: true,
        format: true,
        navigation: true,
        semantic: true,
        structure: true,
        verification: true
      }
    }
  ])
  assert.deepEqual(file.embeddedFiles, [
    {
      embeddedFiles: [],
      fileName: '/test.mdx.jsx',
      languageId: 'javascriptreact',
      typescript: {
        scriptKind: typescript.ScriptKind.JSX
      },
      mappings: [
        {
          sourceOffsets: [0, 15],
          generatedOffsets: [51, 59],
          lengths: [8, 20],
          data: {
            completion: true,
            format: false,
            navigation: true,
            semantic: true,
            structure: true,
            verification: true
          }
        }
      ],
      snapshot: snapshotFromLines(
        '/* @jsxRuntime automatic',
        '@jsxImportSource react */',
        'export {} from "./Layout.js"',
        'import {default as MDXLayout} from "./Layout.js"',
        '/**',
        ' * @deprecated',
        ' *   Do not use.',
        ' *',
        ' * @param {{readonly [K in keyof MDXContentProps]: MDXContentProps[K]}} props',
        ' *   The [props](https://mdxjs.com/docs/using-mdx/#props) that have been passed to the MDX component.',
        ' */',
        'function _createMdxContent(props) {',
        '  return <></>',
        '}',
        '',
        '/**',
        ' * Render the MDX contents.',
        ' *',
        ' * @param {{readonly [K in keyof MDXContentProps]: MDXContentProps[K]}} props',
        ' *   The [props](https://mdxjs.com/docs/using-mdx/#props) that have been passed to the MDX component.',
        ' */',
        'export default function MDXContent(props) {',
        '  return <_createMdxContent {...props} />',
        '}',
        '',
        '// @ts-ignore',
        '/** @typedef {0 extends 1 & Props ? {} : Props} MDXContentProps */',
        ''
      )
    },
    {
      embeddedFiles: [],
      fileName: '/test.mdx.md',
      languageId: 'markdown',
      mappings: [
        {
          sourceOffsets: [35],
          generatedOffsets: [0],
          lengths: [1],
          data: {
            completion: true,
            format: false,
            navigation: true,
            semantic: true,
            structure: true,
            verification: true
          }
        }
      ],
      snapshot: snapshotFromLines('', '')
    }
  ])
})

test('create virtual file w/ MDX layout in case of named and default re-export', () => {
  const plugin = createMdxLanguagePlugin()

  const snapshot = snapshotFromLines(
    'export {named, default} from "./Layout.js"',
    ''
  )

  const file = plugin.createVirtualFile('/test.mdx', 'mdx', snapshot)

  assert.ok(file instanceof VirtualMdxFile)
  assert.equal(file.fileName, '/test.mdx')
  assert.equal(file.languageId, 'mdx')
  assert.ifError(file.error)
  assert.equal(file.snapshot, snapshot)
  assert.deepEqual(file.mappings, [
    {
      sourceOffsets: [0],
      generatedOffsets: [0],
      lengths: [snapshot.getLength()],
      data: {
        completion: true,
        format: true,
        navigation: true,
        semantic: true,
        structure: true,
        verification: true
      }
    }
  ])
  assert.deepEqual(file.embeddedFiles, [
    {
      embeddedFiles: [],
      fileName: '/test.mdx.jsx',
      languageId: 'javascriptreact',
      typescript: {
        scriptKind: typescript.ScriptKind.JSX
      },
      mappings: [
        {
          sourceOffsets: [0, 22],
          generatedOffsets: [51, 66],
          lengths: [15, 20],
          data: {
            completion: true,
            format: false,
            navigation: true,
            semantic: true,
            structure: true,
            verification: true
          }
        }
      ],
      snapshot: snapshotFromLines(
        '/* @jsxRuntime automatic',
        '@jsxImportSource react */',
        'export {named, } from "./Layout.js"',
        'import {default as MDXLayout} from "./Layout.js"',
        '/**',
        ' * @deprecated',
        ' *   Do not use.',
        ' *',
        ' * @param {{readonly [K in keyof MDXContentProps]: MDXContentProps[K]}} props',
        ' *   The [props](https://mdxjs.com/docs/using-mdx/#props) that have been passed to the MDX component.',
        ' */',
        'function _createMdxContent(props) {',
        '  return <></>',
        '}',
        '',
        '/**',
        ' * Render the MDX contents.',
        ' *',
        ' * @param {{readonly [K in keyof MDXContentProps]: MDXContentProps[K]}} props',
        ' *   The [props](https://mdxjs.com/docs/using-mdx/#props) that have been passed to the MDX component.',
        ' */',
        'export default function MDXContent(props) {',
        '  return <_createMdxContent {...props} />',
        '}',
        '',
        '// @ts-ignore',
        '/** @typedef {0 extends 1 & Props ? {} : Props} MDXContentProps */',
        ''
      )
    },
    {
      embeddedFiles: [],
      fileName: '/test.mdx.md',
      languageId: 'markdown',
      mappings: [
        {
          sourceOffsets: [42],
          generatedOffsets: [0],
          lengths: [1],
          data: {
            completion: true,
            format: false,
            navigation: true,
            semantic: true,
            structure: true,
            verification: true
          }
        }
      ],
      snapshot: snapshotFromLines('', '')
    }
  ])
})

test('create virtual file w/ MDX layout in case of default and named re-export', () => {
  const plugin = createMdxLanguagePlugin()

  const snapshot = snapshotFromLines(
    'export {default, named} from "./Layout.js"',
    ''
  )

  const file = plugin.createVirtualFile('/test.mdx', 'mdx', snapshot)

  assert.ok(file instanceof VirtualMdxFile)
  assert.equal(file.fileName, '/test.mdx')
  assert.equal(file.languageId, 'mdx')
  assert.ifError(file.error)
  assert.equal(file.snapshot, snapshot)
  assert.deepEqual(file.mappings, [
    {
      sourceOffsets: [0],
      generatedOffsets: [0],
      lengths: [snapshot.getLength()],
      data: {
        completion: true,
        format: true,
        navigation: true,
        semantic: true,
        structure: true,
        verification: true
      }
    }
  ])
  assert.deepEqual(file.embeddedFiles, [
    {
      embeddedFiles: [],
      fileName: '/test.mdx.jsx',
      languageId: 'javascriptreact',
      typescript: {
        scriptKind: typescript.ScriptKind.JSX
      },
      mappings: [
        {
          sourceOffsets: [0, 16],
          generatedOffsets: [51, 59],
          lengths: [8, 26],
          data: {
            completion: true,
            format: false,
            navigation: true,
            semantic: true,
            structure: true,
            verification: true
          }
        }
      ],
      snapshot: snapshotFromLines(
        '/* @jsxRuntime automatic',
        '@jsxImportSource react */',
        'export { named} from "./Layout.js"',
        'import {default as MDXLayout} from "./Layout.js"',
        '/**',
        ' * @deprecated',
        ' *   Do not use.',
        ' *',
        ' * @param {{readonly [K in keyof MDXContentProps]: MDXContentProps[K]}} props',
        ' *   The [props](https://mdxjs.com/docs/using-mdx/#props) that have been passed to the MDX component.',
        ' */',
        'function _createMdxContent(props) {',
        '  return <></>',
        '}',
        '',
        '/**',
        ' * Render the MDX contents.',
        ' *',
        ' * @param {{readonly [K in keyof MDXContentProps]: MDXContentProps[K]}} props',
        ' *   The [props](https://mdxjs.com/docs/using-mdx/#props) that have been passed to the MDX component.',
        ' */',
        'export default function MDXContent(props) {',
        '  return <_createMdxContent {...props} />',
        '}',
        '',
        '// @ts-ignore',
        '/** @typedef {0 extends 1 & Props ? {} : Props} MDXContentProps */',
        ''
      )
    },
    {
      embeddedFiles: [],
      fileName: '/test.mdx.md',
      languageId: 'markdown',
      mappings: [
        {
          sourceOffsets: [42],
          generatedOffsets: [0],
          lengths: [1],
          data: {
            completion: true,
            format: false,
            navigation: true,
            semantic: true,
            structure: true,
            verification: true
          }
        }
      ],
      snapshot: snapshotFromLines('', '')
    }
  ])
})

test('create virtual file w/ MDX layout in case of a default exported arrow function', () => {
  const plugin = createMdxLanguagePlugin()

  const snapshot = snapshotFromLines('export default () => {}', '')

  const file = plugin.createVirtualFile('/test.mdx', 'mdx', snapshot)

  assert.ok(file instanceof VirtualMdxFile)
  assert.equal(file.fileName, '/test.mdx')
  assert.equal(file.languageId, 'mdx')
  assert.ifError(file.error)
  assert.equal(file.snapshot, snapshot)
  assert.deepEqual(file.mappings, [
    {
      sourceOffsets: [0],
      generatedOffsets: [0],
      lengths: [snapshot.getLength()],
      data: {
        completion: true,
        format: true,
        navigation: true,
        semantic: true,
        structure: true,
        verification: true
      }
    }
  ])
  assert.deepEqual(file.embeddedFiles, [
    {
      embeddedFiles: [],
      fileName: '/test.mdx.jsx',
      languageId: 'javascriptreact',
      typescript: {
        scriptKind: typescript.ScriptKind.JSX
      },
      mappings: [
        {
          sourceOffsets: [15],
          generatedOffsets: [721],
          lengths: [8],
          data: {
            completion: true,
            format: false,
            navigation: true,
            semantic: true,
            structure: true,
            verification: true
          }
        }
      ],
      snapshot: snapshotFromLines(
        '/* @jsxRuntime automatic',
        '@jsxImportSource react */',
        '',
        '/** @typedef {MDXContentProps & { children: JSX.Element }} MDXLayoutProps */',
        '',
        '/**',
        ' * There is one special component: [MDX layout](https://mdxjs.com/docs/using-mdx/#layout).',
        ' * If it is defined, it’s used to wrap all content.',
        ' * A layout can be defined from within MDX using a default export.',
        ' *',
        ' * @param {{readonly [K in keyof MDXLayoutProps]: MDXLayoutProps[K]}} props',
        ' *   The [props](https://mdxjs.com/docs/using-mdx/#props) that have been passed to the MDX component.',
        ' *   In addition, the MDX layout receives the `children` prop, which contains the rendered MDX content.',
        ' * @returns {JSX.Element}',
        ' *   The MDX content wrapped in the layout.',
        ' */',
        'const MDXLayout = () => {}',
        '',
        '/**',
        ' * @deprecated',
        ' *   Do not use.',
        ' *',
        ' * @param {{readonly [K in keyof MDXContentProps]: MDXContentProps[K]}} props',
        ' *   The [props](https://mdxjs.com/docs/using-mdx/#props) that have been passed to the MDX component.',
        ' */',
        'function _createMdxContent(props) {',
        '  return <></>',
        '}',
        '',
        '/**',
        ' * Render the MDX contents.',
        ' *',
        ' * @param {{readonly [K in keyof MDXContentProps]: MDXContentProps[K]}} props',
        ' *   The [props](https://mdxjs.com/docs/using-mdx/#props) that have been passed to the MDX component.',
        ' */',
        'export default function MDXContent(props) {',
        '  return <_createMdxContent {...props} />',
        '}',
        '',
        '// @ts-ignore',
        '/** @typedef {0 extends 1 & Props ? {} : Props} MDXContentProps */',
        ''
      )
    },
    {
      embeddedFiles: [],
      fileName: '/test.mdx.md',
      languageId: 'markdown',
      mappings: [
        {
          sourceOffsets: [23],
          generatedOffsets: [0],
          lengths: [1],
          data: {
            completion: true,
            format: false,
            navigation: true,
            semantic: true,
            structure: true,
            verification: true
          }
        }
      ],
      snapshot: snapshotFromLines('', '')
    }
  ])
})

test('create virtual file w/ MDX layout in case of a default exported function declaration', () => {
  const plugin = createMdxLanguagePlugin()

  const snapshot = snapshotFromLines(
    'export default function MDXLayout() {}',
    ''
  )

  const file = plugin.createVirtualFile('/test.mdx', 'mdx', snapshot)

  assert.ok(file instanceof VirtualMdxFile)
  assert.equal(file.fileName, '/test.mdx')
  assert.equal(file.languageId, 'mdx')
  assert.ifError(file.error)
  assert.equal(file.snapshot, snapshot)
  assert.deepEqual(file.mappings, [
    {
      sourceOffsets: [0],
      generatedOffsets: [0],
      lengths: [snapshot.getLength()],
      data: {
        completion: true,
        format: true,
        navigation: true,
        semantic: true,
        structure: true,
        verification: true
      }
    }
  ])
  assert.deepEqual(file.embeddedFiles, [
    {
      embeddedFiles: [],
      fileName: '/test.mdx.jsx',
      languageId: 'javascriptreact',
      typescript: {
        scriptKind: typescript.ScriptKind.JSX
      },
      mappings: [
        {
          sourceOffsets: [15],
          generatedOffsets: [721],
          lengths: [23],
          data: {
            completion: true,
            format: false,
            navigation: true,
            semantic: true,
            structure: true,
            verification: true
          }
        }
      ],
      snapshot: snapshotFromLines(
        '/* @jsxRuntime automatic',
        '@jsxImportSource react */',
        '',
        '/** @typedef {MDXContentProps & { children: JSX.Element }} MDXLayoutProps */',
        '',
        '/**',
        ' * There is one special component: [MDX layout](https://mdxjs.com/docs/using-mdx/#layout).',
        ' * If it is defined, it’s used to wrap all content.',
        ' * A layout can be defined from within MDX using a default export.',
        ' *',
        ' * @param {{readonly [K in keyof MDXLayoutProps]: MDXLayoutProps[K]}} props',
        ' *   The [props](https://mdxjs.com/docs/using-mdx/#props) that have been passed to the MDX component.',
        ' *   In addition, the MDX layout receives the `children` prop, which contains the rendered MDX content.',
        ' * @returns {JSX.Element}',
        ' *   The MDX content wrapped in the layout.',
        ' */',
        'const MDXLayout = function MDXLayout() {}',
        '',
        '/**',
        ' * @deprecated',
        ' *   Do not use.',
        ' *',
        ' * @param {{readonly [K in keyof MDXContentProps]: MDXContentProps[K]}} props',
        ' *   The [props](https://mdxjs.com/docs/using-mdx/#props) that have been passed to the MDX component.',
        ' */',
        'function _createMdxContent(props) {',
        '  return <></>',
        '}',
        '',
        '/**',
        ' * Render the MDX contents.',
        ' *',
        ' * @param {{readonly [K in keyof MDXContentProps]: MDXContentProps[K]}} props',
        ' *   The [props](https://mdxjs.com/docs/using-mdx/#props) that have been passed to the MDX component.',
        ' */',
        'export default function MDXContent(props) {',
        '  return <_createMdxContent {...props} />',
        '}',
        '',
        '// @ts-ignore',
        '/** @typedef {0 extends 1 & Props ? {} : Props} MDXContentProps */',
        ''
      )
    },
    {
      embeddedFiles: [],
      fileName: '/test.mdx.md',
      languageId: 'markdown',
      mappings: [
        {
          sourceOffsets: [38],
          generatedOffsets: [0],
          lengths: [1],
          data: {
            completion: true,
            format: false,
            navigation: true,
            semantic: true,
            structure: true,
            verification: true
          }
        }
      ],
      snapshot: snapshotFromLines('', '')
    }
  ])
})

test('create virtual file w/ MDX layout in case of a default exported constant', () => {
  const plugin = createMdxLanguagePlugin()

  const snapshot = snapshotFromLines('export default "main"', '')

  const file = plugin.createVirtualFile('/test.mdx', 'mdx', snapshot)

  assert.ok(file instanceof VirtualMdxFile)
  assert.equal(file.fileName, '/test.mdx')
  assert.equal(file.languageId, 'mdx')
  assert.ifError(file.error)
  assert.equal(file.snapshot, snapshot)
  assert.deepEqual(file.mappings, [
    {
      sourceOffsets: [0],
      generatedOffsets: [0],
      lengths: [snapshot.getLength()],
      data: {
        completion: true,
        format: true,
        navigation: true,
        semantic: true,
        structure: true,
        verification: true
      }
    }
  ])
  assert.deepEqual(file.embeddedFiles, [
    {
      embeddedFiles: [],
      fileName: '/test.mdx.jsx',
      languageId: 'javascriptreact',
      typescript: {
        scriptKind: typescript.ScriptKind.JSX
      },
      mappings: [
        {
          sourceOffsets: [15],
          generatedOffsets: [70],
          lengths: [6],
          data: {
            completion: true,
            format: false,
            navigation: true,
            semantic: true,
            structure: true,
            verification: true
          }
        }
      ],
      snapshot: snapshotFromLines(
        '/* @jsxRuntime automatic',
        '@jsxImportSource react */',
        '',
        'const MDXLayout = "main"',
        '',
        '/**',
        ' * @deprecated',
        ' *   Do not use.',
        ' *',
        ' * @param {{readonly [K in keyof MDXContentProps]: MDXContentProps[K]}} props',
        ' *   The [props](https://mdxjs.com/docs/using-mdx/#props) that have been passed to the MDX component.',
        ' */',
        'function _createMdxContent(props) {',
        '  return <></>',
        '}',
        '',
        '/**',
        ' * Render the MDX contents.',
        ' *',
        ' * @param {{readonly [K in keyof MDXContentProps]: MDXContentProps[K]}} props',
        ' *   The [props](https://mdxjs.com/docs/using-mdx/#props) that have been passed to the MDX component.',
        ' */',
        'export default function MDXContent(props) {',
        '  return <_createMdxContent {...props} />',
        '}',
        '',
        '// @ts-ignore',
        '/** @typedef {0 extends 1 & Props ? {} : Props} MDXContentProps */',
        ''
      )
    },
    {
      embeddedFiles: [],
      fileName: '/test.mdx.md',
      languageId: 'markdown',
      mappings: [
        {
          sourceOffsets: [21],
          generatedOffsets: [0],
          lengths: [1],
          data: {
            completion: true,
            format: false,
            navigation: true,
            semantic: true,
            structure: true,
            verification: true
          }
        }
      ],
      snapshot: snapshotFromLines('', '')
    }
  ])
})

test('create virtual file w/ MDX layout and matching argument name', () => {
  const plugin = createMdxLanguagePlugin()

  const snapshot = snapshotFromLines(
    'export default function MDXLayout(properties) {}',
    ''
  )

  const file = plugin.createVirtualFile('/test.mdx', 'mdx', snapshot)

  assert.ok(file instanceof VirtualMdxFile)
  assert.equal(file.fileName, '/test.mdx')
  assert.equal(file.languageId, 'mdx')
  assert.ifError(file.error)
  assert.equal(file.snapshot, snapshot)
  assert.deepEqual(file.mappings, [
    {
      sourceOffsets: [0],
      generatedOffsets: [0],
      lengths: [snapshot.getLength()],
      data: {
        completion: true,
        format: true,
        navigation: true,
        semantic: true,
        structure: true,
        verification: true
      }
    }
  ])
  assert.deepEqual(file.embeddedFiles, [
    {
      embeddedFiles: [],
      fileName: '/test.mdx.jsx',
      languageId: 'javascriptreact',
      typescript: {
        scriptKind: typescript.ScriptKind.JSX
      },
      mappings: [
        {
          sourceOffsets: [15],
          generatedOffsets: [726],
          lengths: [33],
          data: {
            completion: true,
            format: false,
            navigation: true,
            semantic: true,
            structure: true,
            verification: true
          }
        }
      ],
      snapshot: snapshotFromLines(
        '/* @jsxRuntime automatic',
        '@jsxImportSource react */',
        '',
        '/** @typedef {MDXContentProps & { children: JSX.Element }} MDXLayoutProps */',
        '',
        '/**',
        ' * There is one special component: [MDX layout](https://mdxjs.com/docs/using-mdx/#layout).',
        ' * If it is defined, it’s used to wrap all content.',
        ' * A layout can be defined from within MDX using a default export.',
        ' *',
        ' * @param {{readonly [K in keyof MDXLayoutProps]: MDXLayoutProps[K]}} properties',
        ' *   The [props](https://mdxjs.com/docs/using-mdx/#props) that have been passed to the MDX component.',
        ' *   In addition, the MDX layout receives the `children` prop, which contains the rendered MDX content.',
        ' * @returns {JSX.Element}',
        ' *   The MDX content wrapped in the layout.',
        ' */',
        'const MDXLayout = function MDXLayout(properties) {}',
        '',
        '/**',
        ' * @deprecated',
        ' *   Do not use.',
        ' *',
        ' * @param {{readonly [K in keyof MDXContentProps]: MDXContentProps[K]}} props',
        ' *   The [props](https://mdxjs.com/docs/using-mdx/#props) that have been passed to the MDX component.',
        ' */',
        'function _createMdxContent(props) {',
        '  return <></>',
        '}',
        '',
        '/**',
        ' * Render the MDX contents.',
        ' *',
        ' * @param {{readonly [K in keyof MDXContentProps]: MDXContentProps[K]}} props',
        ' *   The [props](https://mdxjs.com/docs/using-mdx/#props) that have been passed to the MDX component.',
        ' */',
        'export default function MDXContent(props) {',
        '  return <_createMdxContent {...props} />',
        '}',
        '',
        '// @ts-ignore',
        '/** @typedef {0 extends 1 & Props ? {} : Props} MDXContentProps */',
        ''
      )
    },
    {
      embeddedFiles: [],
      fileName: '/test.mdx.md',
      languageId: 'markdown',
      mappings: [
        {
          sourceOffsets: [48],
          generatedOffsets: [0],
          lengths: [1],
          data: {
            completion: true,
            format: false,
            navigation: true,
            semantic: true,
            structure: true,
            verification: true
          }
        }
      ],
      snapshot: snapshotFromLines('', '')
    }
  ])
})

test('create virtual file w/ MDX layout in case of a default export followed by a named', () => {
  const plugin = createMdxLanguagePlugin()

  const snapshot = snapshotFromLines(
    'export default function MDXLayout() {}',
    'export function named() {}',
    ''
  )

  const file = plugin.createVirtualFile('/test.mdx', 'mdx', snapshot)

  assert.ok(file instanceof VirtualMdxFile)
  assert.equal(file.fileName, '/test.mdx')
  assert.equal(file.languageId, 'mdx')
  assert.ifError(file.error)
  assert.equal(file.snapshot, snapshot)
  assert.deepEqual(file.mappings, [
    {
      sourceOffsets: [0],
      generatedOffsets: [0],
      lengths: [snapshot.getLength()],
      data: {
        completion: true,
        format: true,
        navigation: true,
        semantic: true,
        structure: true,
        verification: true
      }
    }
  ])
  assert.deepEqual(file.embeddedFiles, [
    {
      embeddedFiles: [],
      fileName: '/test.mdx.jsx',
      languageId: 'javascriptreact',
      typescript: {
        scriptKind: typescript.ScriptKind.JSX
      },
      mappings: [
        {
          sourceOffsets: [15, 39],
          generatedOffsets: [721, 745],
          lengths: [23, 26],
          data: {
            completion: true,
            format: false,
            navigation: true,
            semantic: true,
            structure: true,
            verification: true
          }
        }
      ],
      snapshot: snapshotFromLines(
        '/* @jsxRuntime automatic',
        '@jsxImportSource react */',
        '',
        '/** @typedef {MDXContentProps & { children: JSX.Element }} MDXLayoutProps */',
        '',
        '/**',
        ' * There is one special component: [MDX layout](https://mdxjs.com/docs/using-mdx/#layout).',
        ' * If it is defined, it’s used to wrap all content.',
        ' * A layout can be defined from within MDX using a default export.',
        ' *',
        ' * @param {{readonly [K in keyof MDXLayoutProps]: MDXLayoutProps[K]}} props',
        ' *   The [props](https://mdxjs.com/docs/using-mdx/#props) that have been passed to the MDX component.',
        ' *   In addition, the MDX layout receives the `children` prop, which contains the rendered MDX content.',
        ' * @returns {JSX.Element}',
        ' *   The MDX content wrapped in the layout.',
        ' */',
        'const MDXLayout = function MDXLayout() {}',
        'export function named() {}',
        '',
        '/**',
        ' * @deprecated',
        ' *   Do not use.',
        ' *',
        ' * @param {{readonly [K in keyof MDXContentProps]: MDXContentProps[K]}} props',
        ' *   The [props](https://mdxjs.com/docs/using-mdx/#props) that have been passed to the MDX component.',
        ' */',
        'function _createMdxContent(props) {',
        '  return <></>',
        '}',
        '',
        '/**',
        ' * Render the MDX contents.',
        ' *',
        ' * @param {{readonly [K in keyof MDXContentProps]: MDXContentProps[K]}} props',
        ' *   The [props](https://mdxjs.com/docs/using-mdx/#props) that have been passed to the MDX component.',
        ' */',
        'export default function MDXContent(props) {',
        '  return <_createMdxContent {...props} />',
        '}',
        '',
        '// @ts-ignore',
        '/** @typedef {0 extends 1 & Props ? {} : Props} MDXContentProps */',
        ''
      )
    },
    {
      embeddedFiles: [],
      fileName: '/test.mdx.md',
      languageId: 'markdown',
      mappings: [
        {
          sourceOffsets: [65],
          generatedOffsets: [0],
          lengths: [1],
          data: {
            completion: true,
            format: false,
            navigation: true,
            semantic: true,
            structure: true,
            verification: true
          }
        }
      ],
      snapshot: snapshotFromLines('', '')
    }
  ])
})

test('create virtual file w/ MDX layout in case of a default export preceded by a named', () => {
  const plugin = createMdxLanguagePlugin()

  const snapshot = snapshotFromLines(
    'export function named() {}',
    'export default function MDXLayout() {}',
    ''
  )

  const file = plugin.createVirtualFile('/test.mdx', 'mdx', snapshot)

  assert.ok(file instanceof VirtualMdxFile)
  assert.equal(file.fileName, '/test.mdx')
  assert.equal(file.languageId, 'mdx')
  assert.ifError(file.error)
  assert.equal(file.snapshot, snapshot)
  assert.deepEqual(file.mappings, [
    {
      sourceOffsets: [0],
      generatedOffsets: [0],
      lengths: [snapshot.getLength()],
      data: {
        completion: true,
        format: true,
        navigation: true,
        semantic: true,
        structure: true,
        verification: true
      }
    }
  ])
  assert.deepEqual(file.embeddedFiles, [
    {
      embeddedFiles: [],
      fileName: '/test.mdx.jsx',
      languageId: 'javascriptreact',
      typescript: {
        scriptKind: typescript.ScriptKind.JSX
      },
      mappings: [
        {
          sourceOffsets: [0, 42],
          generatedOffsets: [51, 748],
          lengths: [26, 23],
          data: {
            completion: true,
            format: false,
            navigation: true,
            semantic: true,
            structure: true,
            verification: true
          }
        }
      ],
      snapshot: snapshotFromLines(
        '/* @jsxRuntime automatic',
        '@jsxImportSource react */',
        'export function named() {}',
        '',
        '/** @typedef {MDXContentProps & { children: JSX.Element }} MDXLayoutProps */',
        '',
        '/**',
        ' * There is one special component: [MDX layout](https://mdxjs.com/docs/using-mdx/#layout).',
        ' * If it is defined, it’s used to wrap all content.',
        ' * A layout can be defined from within MDX using a default export.',
        ' *',
        ' * @param {{readonly [K in keyof MDXLayoutProps]: MDXLayoutProps[K]}} props',
        ' *   The [props](https://mdxjs.com/docs/using-mdx/#props) that have been passed to the MDX component.',
        ' *   In addition, the MDX layout receives the `children` prop, which contains the rendered MDX content.',
        ' * @returns {JSX.Element}',
        ' *   The MDX content wrapped in the layout.',
        ' */',
        'const MDXLayout = function MDXLayout() {}',
        '',
        '/**',
        ' * @deprecated',
        ' *   Do not use.',
        ' *',
        ' * @param {{readonly [K in keyof MDXContentProps]: MDXContentProps[K]}} props',
        ' *   The [props](https://mdxjs.com/docs/using-mdx/#props) that have been passed to the MDX component.',
        ' */',
        'function _createMdxContent(props) {',
        '  return <></>',
        '}',
        '',
        '/**',
        ' * Render the MDX contents.',
        ' *',
        ' * @param {{readonly [K in keyof MDXContentProps]: MDXContentProps[K]}} props',
        ' *   The [props](https://mdxjs.com/docs/using-mdx/#props) that have been passed to the MDX component.',
        ' */',
        'export default function MDXContent(props) {',
        '  return <_createMdxContent {...props} />',
        '}',
        '',
        '// @ts-ignore',
        '/** @typedef {0 extends 1 & Props ? {} : Props} MDXContentProps */',
        ''
      )
    },
    {
      embeddedFiles: [],
      fileName: '/test.mdx.md',
      languageId: 'markdown',
      mappings: [
        {
          sourceOffsets: [65],
          generatedOffsets: [0],
          lengths: [1],
          data: {
            completion: true,
            format: false,
            navigation: true,
            semantic: true,
            structure: true,
            verification: true
          }
        }
      ],
      snapshot: snapshotFromLines('', '')
    }
  ])
})

test('create virtual file w/ mdxFlowExpression', () => {
  const plugin = createMdxLanguagePlugin()

  const snapshot = snapshotFromLines('{Math.PI}', '')

  const file = plugin.createVirtualFile('/test.mdx', 'mdx', snapshot)

  assert.ok(file instanceof VirtualMdxFile)
  assert.equal(file.fileName, '/test.mdx')
  assert.equal(file.languageId, 'mdx')
  assert.ifError(file.error)
  assert.equal(file.snapshot, snapshot)
  assert.deepEqual(file.mappings, [
    {
      sourceOffsets: [0],
      generatedOffsets: [0],
      lengths: [snapshot.getLength()],
      data: {
        completion: true,
        format: true,
        navigation: true,
        semantic: true,
        structure: true,
        verification: true
      }
    }
  ])
  assert.deepEqual(file.embeddedFiles, [
    {
      embeddedFiles: [],
      fileName: '/test.mdx.jsx',
      languageId: 'javascriptreact',
      typescript: {
        scriptKind: typescript.ScriptKind.JSX
      },
      mappings: [
        {
          sourceOffsets: [0],
          generatedOffsets: [322],
          lengths: [9],
          data: {
            completion: true,
            format: false,
            navigation: true,
            semantic: true,
            structure: true,
            verification: true
          }
        }
      ],
      snapshot: snapshotFromLines(
        '/* @jsxRuntime automatic',
        '@jsxImportSource react */',
        '',
        '/**',
        ' * @deprecated',
        ' *   Do not use.',
        ' *',
        ' * @param {{readonly [K in keyof MDXContentProps]: MDXContentProps[K]}} props',
        ' *   The [props](https://mdxjs.com/docs/using-mdx/#props) that have been passed to the MDX component.',
        ' */',
        'function _createMdxContent(props) {',
        '  return <>{Math.PI}</>',
        '}',
        '',
        '/**',
        ' * Render the MDX contents.',
        ' *',
        ' * @param {{readonly [K in keyof MDXContentProps]: MDXContentProps[K]}} props',
        ' *   The [props](https://mdxjs.com/docs/using-mdx/#props) that have been passed to the MDX component.',
        ' */',
        'export default function MDXContent(props) {',
        '  return <_createMdxContent {...props} />',
        '}',
        '',
        '// @ts-ignore',
        '/** @typedef {0 extends 1 & Props ? {} : Props} MDXContentProps */',
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
            format: false,
            navigation: true,
            semantic: true,
            structure: true,
            verification: true
          }
        }
      ],
      snapshot: snapshotFromLines('', '')
    }
  ])
})

test('create virtual file w/ mdxJsxFlowElement w/ children', () => {
  const plugin = createMdxLanguagePlugin()

  const snapshot = snapshotFromLines(
    '<div>',
    '',
    '  This content should not be part of the JSX embed',
    '',
    '</div>',
    ''
  )

  const file = plugin.createVirtualFile('/test.mdx', 'mdx', snapshot)

  assert.ok(file instanceof VirtualMdxFile)
  assert.equal(file.fileName, '/test.mdx')
  assert.equal(file.languageId, 'mdx')
  assert.ifError(file.error)
  assert.equal(file.snapshot, snapshot)
  assert.deepEqual(file.mappings, [
    {
      sourceOffsets: [0],
      generatedOffsets: [0],
      lengths: [snapshot.getLength()],
      data: {
        completion: true,
        format: true,
        navigation: true,
        semantic: true,
        structure: true,
        verification: true
      }
    }
  ])
  assert.deepEqual(file.embeddedFiles, [
    {
      embeddedFiles: [],
      fileName: '/test.mdx.jsx',
      languageId: 'javascriptreact',
      typescript: {
        scriptKind: typescript.ScriptKind.JSX
      },
      mappings: [
        {
          sourceOffsets: [0, 57],
          generatedOffsets: [322, 340],
          lengths: [9, 8],
          data: {
            completion: true,
            format: false,
            navigation: true,
            semantic: true,
            structure: true,
            verification: true
          }
        }
      ],
      snapshot: snapshotFromLines(
        '/* @jsxRuntime automatic',
        '@jsxImportSource react */',
        '',
        '/**',
        ' * @deprecated',
        ' *   Do not use.',
        ' *',
        ' * @param {{readonly [K in keyof MDXContentProps]: MDXContentProps[K]}} props',
        ' *   The [props](https://mdxjs.com/docs/using-mdx/#props) that have been passed to the MDX component.',
        ' */',
        'function _createMdxContent(props) {',
        '  return <><div>',
        '',
        "  <>{''}</>",
        '',
        '</div></>',
        '}',
        '',
        '/**',
        ' * Render the MDX contents.',
        ' *',
        ' * @param {{readonly [K in keyof MDXContentProps]: MDXContentProps[K]}} props',
        ' *   The [props](https://mdxjs.com/docs/using-mdx/#props) that have been passed to the MDX component.',
        ' */',
        'export default function MDXContent(props) {',
        '  return <_createMdxContent {...props} />',
        '}',
        '',
        '// @ts-ignore',
        '/** @typedef {0 extends 1 & Props ? {} : Props} MDXContentProps */',
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
            format: false,
            navigation: true,
            semantic: true,
            structure: true,
            verification: true
          }
        }
      ],
      snapshot: snapshotFromLines(
        'This content should not be part of the JSX embed<!---->',
        ''
      )
    }
  ])
})

test('create virtual file w/ mdxJsxFlowElement w/o children', () => {
  const plugin = createMdxLanguagePlugin()

  const snapshot = snapshotFromLines('<div />', '')

  const file = plugin.createVirtualFile('/test.mdx', 'mdx', snapshot)

  assert.ok(file instanceof VirtualMdxFile)
  assert.equal(file.fileName, '/test.mdx')
  assert.equal(file.languageId, 'mdx')
  assert.ifError(file.error)
  assert.equal(file.snapshot, snapshot)
  assert.deepEqual(file.mappings, [
    {
      sourceOffsets: [0],
      generatedOffsets: [0],
      lengths: [snapshot.getLength()],
      data: {
        completion: true,
        format: true,
        navigation: true,
        semantic: true,
        structure: true,
        verification: true
      }
    }
  ])
  assert.deepEqual(file.embeddedFiles, [
    {
      embeddedFiles: [],
      fileName: '/test.mdx.jsx',
      languageId: 'javascriptreact',
      mappings: [
        {
          sourceOffsets: [0],
          generatedOffsets: [322],
          lengths: [7],
          data: {
            completion: true,
            format: false,
            navigation: true,
            semantic: true,
            structure: true,
            verification: true
          }
        }
      ],
      snapshot: snapshotFromLines(
        '/* @jsxRuntime automatic',
        '@jsxImportSource react */',
        '',
        '/**',
        ' * @deprecated',
        ' *   Do not use.',
        ' *',
        ' * @param {{readonly [K in keyof MDXContentProps]: MDXContentProps[K]}} props',
        ' *   The [props](https://mdxjs.com/docs/using-mdx/#props) that have been passed to the MDX component.',
        ' */',
        'function _createMdxContent(props) {',
        '  return <><div /></>',
        '}',
        '',
        '/**',
        ' * Render the MDX contents.',
        ' *',
        ' * @param {{readonly [K in keyof MDXContentProps]: MDXContentProps[K]}} props',
        ' *   The [props](https://mdxjs.com/docs/using-mdx/#props) that have been passed to the MDX component.',
        ' */',
        'export default function MDXContent(props) {',
        '  return <_createMdxContent {...props} />',
        '}',
        '',
        '// @ts-ignore',
        '/** @typedef {0 extends 1 & Props ? {} : Props} MDXContentProps */',
        ''
      ),
      typescript: {
        scriptKind: typescript.ScriptKind.JSX
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
            format: false,
            navigation: true,
            semantic: true,
            structure: true,
            verification: true
          }
        }
      ],
      snapshot: snapshotFromLines('', '')
    }
  ])
})

test('create virtual file w/ mdxJsxTextElement', () => {
  const plugin = createMdxLanguagePlugin()

  const snapshot = snapshotFromLines('A <div />', '')

  const file = plugin.createVirtualFile('/test.mdx', 'mdx', snapshot)

  assert.ok(file instanceof VirtualMdxFile)
  assert.equal(file.fileName, '/test.mdx')
  assert.equal(file.languageId, 'mdx')
  assert.ifError(file.error)
  assert.equal(file.snapshot, snapshot)
  assert.deepEqual(file.mappings, [
    {
      sourceOffsets: [0],
      generatedOffsets: [0],
      lengths: [snapshot.getLength()],
      data: {
        completion: true,
        format: true,
        navigation: true,
        semantic: true,
        structure: true,
        verification: true
      }
    }
  ])
  assert.deepEqual(file.embeddedFiles, [
    {
      embeddedFiles: [],
      fileName: '/test.mdx.jsx',
      languageId: 'javascriptreact',
      typescript: {
        scriptKind: typescript.ScriptKind.JSX
      },
      mappings: [
        {
          sourceOffsets: [2],
          generatedOffsets: [328],
          lengths: [7],
          data: {
            completion: true,
            format: false,
            navigation: true,
            semantic: true,
            structure: true,
            verification: true
          }
        }
      ],
      snapshot: snapshotFromLines(
        '/* @jsxRuntime automatic',
        '@jsxImportSource react */',
        '',
        '/**',
        ' * @deprecated',
        ' *   Do not use.',
        ' *',
        ' * @param {{readonly [K in keyof MDXContentProps]: MDXContentProps[K]}} props',
        ' *   The [props](https://mdxjs.com/docs/using-mdx/#props) that have been passed to the MDX component.',
        ' */',
        'function _createMdxContent(props) {',
        "  return <><>{''}<div /></></>",
        '}',
        '',
        '/**',
        ' * Render the MDX contents.',
        ' *',
        ' * @param {{readonly [K in keyof MDXContentProps]: MDXContentProps[K]}} props',
        ' *   The [props](https://mdxjs.com/docs/using-mdx/#props) that have been passed to the MDX component.',
        ' */',
        'export default function MDXContent(props) {',
        '  return <_createMdxContent {...props} />',
        '}',
        '',
        '// @ts-ignore',
        '/** @typedef {0 extends 1 & Props ? {} : Props} MDXContentProps */',
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
            format: false,
            navigation: true,
            semantic: true,
            structure: true,
            verification: true
          }
        }
      ],
      snapshot: snapshotFromLines('A <!---->', '')
    }
  ])
})

test('create virtual file w/ mdxTextExpression', () => {
  const plugin = createMdxLanguagePlugin()

  const snapshot = snapshotFromLines('3 < {Math.PI} < 4', '')

  const file = plugin.createVirtualFile('/test.mdx', 'mdx', snapshot)

  assert.ok(file instanceof VirtualMdxFile)
  assert.equal(file.fileName, '/test.mdx')
  assert.equal(file.languageId, 'mdx')
  assert.ifError(file.error)
  assert.equal(file.snapshot, snapshot)
  assert.deepEqual(file.mappings, [
    {
      sourceOffsets: [0],
      generatedOffsets: [0],
      lengths: [snapshot.getLength()],
      data: {
        completion: true,
        format: true,
        navigation: true,
        semantic: true,
        structure: true,
        verification: true
      }
    }
  ])
  assert.deepEqual(file.embeddedFiles, [
    {
      embeddedFiles: [],
      fileName: '/test.mdx.jsx',
      languageId: 'javascriptreact',
      typescript: {
        scriptKind: typescript.ScriptKind.JSX
      },
      mappings: [
        {
          generatedOffsets: [328],
          sourceOffsets: [4],
          lengths: [9],
          data: {
            completion: true,
            format: false,
            navigation: true,
            semantic: true,
            structure: true,
            verification: true
          }
        }
      ],
      snapshot: snapshotFromLines(
        '/* @jsxRuntime automatic',
        '@jsxImportSource react */',
        '',
        '/**',
        ' * @deprecated',
        ' *   Do not use.',
        ' *',
        ' * @param {{readonly [K in keyof MDXContentProps]: MDXContentProps[K]}} props',
        ' *   The [props](https://mdxjs.com/docs/using-mdx/#props) that have been passed to the MDX component.',
        ' */',
        'function _createMdxContent(props) {',
        "  return <><>{''}{Math.PI}{''}</></>",
        '}',
        '',
        '/**',
        ' * Render the MDX contents.',
        ' *',
        ' * @param {{readonly [K in keyof MDXContentProps]: MDXContentProps[K]}} props',
        ' *   The [props](https://mdxjs.com/docs/using-mdx/#props) that have been passed to the MDX component.',
        ' */',
        'export default function MDXContent(props) {',
        '  return <_createMdxContent {...props} />',
        '}',
        '',
        '// @ts-ignore',
        '/** @typedef {0 extends 1 & Props ? {} : Props} MDXContentProps */',
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
            format: false,
            navigation: true,
            semantic: true,
            structure: true,
            verification: true
          }
        }
      ],
      snapshot: snapshotFromLines('3 < <!----> < 4', '')
    }
  ])
})

test('create virtual file w/ async mdxTextExpression', () => {
  const plugin = createMdxLanguagePlugin()

  const snapshot = snapshotFromLines(
    '3 < {await Promise.resolve(Math.PI)} < 4',
    ''
  )

  const file = plugin.createVirtualFile('/test.mdx', 'mdx', snapshot)

  assert.ok(file instanceof VirtualMdxFile)
  assert.equal(file.fileName, '/test.mdx')
  assert.equal(file.languageId, 'mdx')
  assert.ifError(file.error)
  assert.equal(file.snapshot, snapshot)
  assert.deepEqual(file.mappings, [
    {
      sourceOffsets: [0],
      generatedOffsets: [0],
      lengths: [snapshot.getLength()],
      data: {
        completion: true,
        format: true,
        navigation: true,
        semantic: true,
        structure: true,
        verification: true
      }
    }
  ])
  assert.deepEqual(file.embeddedFiles, [
    {
      embeddedFiles: [],
      fileName: '/test.mdx.jsx',
      languageId: 'javascriptreact',
      typescript: {
        scriptKind: typescript.ScriptKind.JSX
      },
      mappings: [
        {
          generatedOffsets: [334],
          sourceOffsets: [4],
          lengths: [32],
          data: {
            completion: true,
            format: false,
            navigation: true,
            semantic: true,
            structure: true,
            verification: true
          }
        }
      ],
      snapshot: snapshotFromLines(
        '/* @jsxRuntime automatic',
        '@jsxImportSource react */',
        '',
        '/**',
        ' * @deprecated',
        ' *   Do not use.',
        ' *',
        ' * @param {{readonly [K in keyof MDXContentProps]: MDXContentProps[K]}} props',
        ' *   The [props](https://mdxjs.com/docs/using-mdx/#props) that have been passed to the MDX component.',
        ' */',
        'async function _createMdxContent(props) {',
        "  return <><>{''}{await Promise.resolve(Math.PI)}{''}</></>",
        '}',
        '',
        '/**',
        ' * Render the MDX contents.',
        ' *',
        ' * @param {{readonly [K in keyof MDXContentProps]: MDXContentProps[K]}} props',
        ' *   The [props](https://mdxjs.com/docs/using-mdx/#props) that have been passed to the MDX component.',
        ' */',
        'export default function MDXContent(props) {',
        '  return <_createMdxContent {...props} />',
        '}',
        '',
        '// @ts-ignore',
        '/** @typedef {0 extends 1 & Props ? {} : Props} MDXContentProps */',
        ''
      )
    },
    {
      embeddedFiles: [],
      fileName: '/test.mdx.md',
      languageId: 'markdown',
      mappings: [
        {
          sourceOffsets: [0, 36],
          generatedOffsets: [0, 11],
          lengths: [4, 5],
          data: {
            completion: true,
            format: false,
            navigation: true,
            semantic: true,
            structure: true,
            verification: true
          }
        }
      ],
      snapshot: snapshotFromLines('3 < <!----> < 4', '')
    }
  ])
})

test('create virtual file w/ dedented markdown content', () => {
  const plugin = createMdxLanguagePlugin()

  const snapshot = snapshotFromLines(
    '     | Language |',
    ' | --- |',
    '            | MDX |',
    '     | JavaScript |',
    '| TypeScript |'
  )

  const file = plugin.createVirtualFile('/test.mdx', 'mdx', snapshot)

  assert.ok(file instanceof VirtualMdxFile)
  assert.equal(file.fileName, '/test.mdx')
  assert.equal(file.languageId, 'mdx')
  assert.ifError(file.error)
  assert.equal(file.snapshot, snapshot)
  assert.deepEqual(file.mappings, [
    {
      sourceOffsets: [0],
      generatedOffsets: [0],
      lengths: [snapshot.getLength()],
      data: {
        completion: true,
        format: true,
        navigation: true,
        semantic: true,
        structure: true,
        verification: true
      }
    }
  ])
  assert.deepEqual(file.embeddedFiles, [
    {
      embeddedFiles: [],
      fileName: '/test.mdx.jsx',
      languageId: 'javascriptreact',
      typescript: {
        scriptKind: 2
      },
      mappings: [],
      snapshot: snapshotFromLines(
        '/* @jsxRuntime automatic',
        '@jsxImportSource react */',
        '',
        '/**',
        ' * @deprecated',
        ' *   Do not use.',
        ' *',
        ' * @param {{readonly [K in keyof MDXContentProps]: MDXContentProps[K]}} props',
        ' *   The [props](https://mdxjs.com/docs/using-mdx/#props) that have been passed to the MDX component.',
        ' */',
        'function _createMdxContent(props) {',
        "  return <><>{''}</></>",
        '}',
        '',
        '/**',
        ' * Render the MDX contents.',
        ' *',
        ' * @param {{readonly [K in keyof MDXContentProps]: MDXContentProps[K]}} props',
        ' *   The [props](https://mdxjs.com/docs/using-mdx/#props) that have been passed to the MDX component.',
        ' */',
        'export default function MDXContent(props) {',
        '  return <_createMdxContent {...props} />',
        '}',
        '',
        '// @ts-ignore',
        '/** @typedef {0 extends 1 & Props ? {} : Props} MDXContentProps */',
        ''
      )
    },
    {
      embeddedFiles: [],
      fileName: '/test.mdx.md',
      languageId: 'markdown',
      mappings: [
        {
          sourceOffsets: [5, 19, 39, 52],
          generatedOffsets: [0, 13, 21, 29],
          lengths: [13, 8, 8, 29],
          data: {
            completion: true,
            format: false,
            navigation: true,
            semantic: true,
            structure: true,
            verification: true
          }
        }
      ],
      snapshot: snapshotFromLines(
        '| Language |',
        '| --- |',
        '| MDX |',
        '| JavaScript |',
        '| TypeScript |'
      )
    }
  ])
})

test('create virtual file w/ syntax error', () => {
  const plugin = createMdxLanguagePlugin()

  const snapshot = snapshotFromLines('<', '')

  const file = plugin.createVirtualFile('/test.mdx', 'mdx', snapshot)

  assert.ok(file instanceof VirtualMdxFile)
  assert.equal(file.fileName, '/test.mdx')
  assert.equal(file.languageId, 'mdx')
  assert.ok(file.error instanceof VFileMessage)
  assert.equal(file.snapshot, snapshot)
  assert.deepEqual(file.mappings, [
    {
      sourceOffsets: [0],
      generatedOffsets: [0],
      lengths: [snapshot.getLength()],
      data: {
        completion: true,
        format: true,
        navigation: true,
        semantic: true,
        structure: true,
        verification: true
      }
    }
  ])
  assert.deepEqual(file.embeddedFiles, [
    {
      embeddedFiles: [],
      fileName: '/test.mdx.jsx',
      languageId: 'javascriptreact',
      mappings: [],
      snapshot: snapshotFromLines(
        '/* @jsxRuntime automatic',
        '@jsxImportSource react */',
        '',
        '/**',
        ' * @deprecated',
        ' *   Do not use.',
        ' *',
        ' * @param {{readonly [K in keyof MDXContentProps]: MDXContentProps[K]}} props',
        ' *   The [props](https://mdxjs.com/docs/using-mdx/#props) that have been passed to the MDX component.',
        ' */',
        'function _createMdxContent(props) {',
        '  return <></>',
        '}',
        '',
        '/**',
        ' * Render the MDX contents.',
        ' *',
        ' * @param {{readonly [K in keyof MDXContentProps]: MDXContentProps[K]}} props',
        ' *   The [props](https://mdxjs.com/docs/using-mdx/#props) that have been passed to the MDX component.',
        ' */',
        'export default function MDXContent(props) {',
        '  return <_createMdxContent {...props} />',
        '}',
        '',
        '// @ts-ignore',
        '/** @typedef {0 extends 1 & Props ? {} : Props} MDXContentProps */',
        ''
      ),
      typescript: {
        scriptKind: typescript.ScriptKind.JSX
      }
    },
    {
      embeddedFiles: [],
      fileName: '/test.mdx.md',
      languageId: 'markdown',
      mappings: [],
      snapshot: snapshotFromLines('<', '')
    }
  ])
})

test('create virtual file w/ yaml frontmatter', () => {
  const plugin = createMdxLanguagePlugin([remarkFrontmatter])

  const snapshot = snapshotFromLines('---', 'hello: frontmatter', '---', '')

  const file = plugin.createVirtualFile('/test.mdx', 'mdx', snapshot)

  assert.ok(file instanceof VirtualMdxFile)
  assert.equal(file.fileName, '/test.mdx')
  assert.equal(file.languageId, 'mdx')
  assert.ifError(file.error)
  assert.equal(file.snapshot, snapshot)
  assert.deepEqual(file.mappings, [
    {
      sourceOffsets: [0],
      generatedOffsets: [0],
      lengths: [snapshot.getLength()],
      data: {
        completion: true,
        format: true,
        navigation: true,
        semantic: true,
        structure: true,
        verification: true
      }
    }
  ])
  assert.deepEqual(file.embeddedFiles, [
    {
      embeddedFiles: [],
      fileName: '/test.mdx.jsx',
      languageId: 'javascriptreact',
      mappings: [],
      snapshot: snapshotFromLines(
        '/* @jsxRuntime automatic',
        '@jsxImportSource react */',
        '',
        '/**',
        ' * @deprecated',
        ' *   Do not use.',
        ' *',
        ' * @param {{readonly [K in keyof MDXContentProps]: MDXContentProps[K]}} props',
        ' *   The [props](https://mdxjs.com/docs/using-mdx/#props) that have been passed to the MDX component.',
        ' */',
        'function _createMdxContent(props) {',
        '  return <></>',
        '}',
        '',
        '/**',
        ' * Render the MDX contents.',
        ' *',
        ' * @param {{readonly [K in keyof MDXContentProps]: MDXContentProps[K]}} props',
        ' *   The [props](https://mdxjs.com/docs/using-mdx/#props) that have been passed to the MDX component.',
        ' */',
        'export default function MDXContent(props) {',
        '  return <_createMdxContent {...props} />',
        '}',
        '',
        '// @ts-ignore',
        '/** @typedef {0 extends 1 & Props ? {} : Props} MDXContentProps */',
        ''
      ),
      typescript: {
        scriptKind: typescript.ScriptKind.JSX
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
            format: false,
            navigation: true,
            semantic: true,
            structure: true,
            verification: true
          }
        }
      ],
      snapshot: snapshotFromLines('---', 'hello: frontmatter', '---', '')
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
  ])
})

test('update virtual file', () => {
  const plugin = createMdxLanguagePlugin()

  const file = plugin.createVirtualFile(
    '/test.mdx',
    'mdx',
    snapshotFromLines('Tihs lne haz tyops', '')
  )

  assert.ok(file instanceof VirtualMdxFile)

  const snapshot = snapshotFromLines('This line is fixed', '')
  plugin.updateVirtualFile(file, snapshot)

  assert.equal(file.fileName, '/test.mdx')
  assert.equal(file.languageId, 'mdx')
  assert.ifError(file.error)
  assert.equal(file.snapshot, snapshot)
  assert.deepEqual(file.mappings, [
    {
      sourceOffsets: [0],
      generatedOffsets: [0],
      lengths: [snapshot.getLength()],
      data: {
        completion: true,
        format: true,
        navigation: true,
        semantic: true,
        structure: true,
        verification: true
      }
    }
  ])
  assert.deepEqual(file.embeddedFiles, [
    {
      embeddedFiles: [],
      fileName: '/test.mdx.jsx',
      languageId: 'javascriptreact',
      mappings: [],
      snapshot: snapshotFromLines(
        '/* @jsxRuntime automatic',
        '@jsxImportSource react */',
        '',
        '/**',
        ' * @deprecated',
        ' *   Do not use.',
        ' *',
        ' * @param {{readonly [K in keyof MDXContentProps]: MDXContentProps[K]}} props',
        ' *   The [props](https://mdxjs.com/docs/using-mdx/#props) that have been passed to the MDX component.',
        ' */',
        'function _createMdxContent(props) {',
        "  return <><>{''}</></>",
        '}',
        '',
        '/**',
        ' * Render the MDX contents.',
        ' *',
        ' * @param {{readonly [K in keyof MDXContentProps]: MDXContentProps[K]}} props',
        ' *   The [props](https://mdxjs.com/docs/using-mdx/#props) that have been passed to the MDX component.',
        ' */',
        'export default function MDXContent(props) {',
        '  return <_createMdxContent {...props} />',
        '}',
        '',
        '// @ts-ignore',
        '/** @typedef {0 extends 1 & Props ? {} : Props} MDXContentProps */',
        ''
      ),
      typescript: {
        scriptKind: typescript.ScriptKind.JSX
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
            format: false,
            navigation: true,
            semantic: true,
            structure: true,
            verification: true
          }
        }
      ],
      snapshot: snapshotFromLines('This line is fixed', '')
    }
  ])
})

test('compilation setting defaults', () => {
  const plugin = createMdxLanguagePlugin()

  // @ts-expect-error
  const host = plugin.typescript?.resolveLanguageServiceHost?.({
    getCompilationSettings: () => ({})
  })

  const compilerOptions = host?.getCompilationSettings()

  assert.deepEqual(compilerOptions, {
    allowJs: true
  })
})

test('compilation setting overrides', () => {
  const plugin = createMdxLanguagePlugin()

  // @ts-expect-error
  const host = plugin.typescript?.resolveLanguageServiceHost?.({
    getCompilationSettings: () => ({
      jsx: typescript.JsxEmit.React,
      jsxFactory: 'h',
      jsxFragmentFactory: 'Fragment',
      jsxImportSource: 'preact',
      allowJs: false
    })
  })

  const compilerOptions = host?.getCompilationSettings()

  assert.deepEqual(compilerOptions, {
    allowJs: true,
    jsx: typescript.JsxEmit.React,
    jsxFactory: 'h',
    jsxFragmentFactory: 'Fragment',
    jsxImportSource: 'preact'
  })
})

test('support custom jsxImportSource', () => {
  const plugin = createMdxLanguagePlugin(undefined, 'preact')

  const snapshot = snapshotFromLines('')

  const file = plugin.createVirtualFile('/test.mdx', 'mdx', snapshot)

  assert.ok(file instanceof VirtualMdxFile)
  assert.equal(file.fileName, '/test.mdx')
  assert.equal(file.languageId, 'mdx')
  assert.ifError(file.error)
  assert.equal(file.snapshot, snapshot)
  assert.deepEqual(file.mappings, [
    {
      sourceOffsets: [0],
      generatedOffsets: [0],
      lengths: [snapshot.getLength()],
      data: {
        completion: true,
        format: true,
        navigation: true,
        semantic: true,
        structure: true,
        verification: true
      }
    }
  ])
  assert.deepEqual(file.embeddedFiles, [
    {
      embeddedFiles: [],
      fileName: '/test.mdx.jsx',
      languageId: 'javascriptreact',
      mappings: [],
      snapshot: snapshotFromLines(
        '/* @jsxRuntime automatic',
        '@jsxImportSource preact */',
        '',
        '/**',
        ' * @deprecated',
        ' *   Do not use.',
        ' *',
        ' * @param {{readonly [K in keyof MDXContentProps]: MDXContentProps[K]}} props',
        ' *   The [props](https://mdxjs.com/docs/using-mdx/#props) that have been passed to the MDX component.',
        ' */',
        'function _createMdxContent(props) {',
        '  return <></>',
        '}',
        '',
        '/**',
        ' * Render the MDX contents.',
        ' *',
        ' * @param {{readonly [K in keyof MDXContentProps]: MDXContentProps[K]}} props',
        ' *   The [props](https://mdxjs.com/docs/using-mdx/#props) that have been passed to the MDX component.',
        ' */',
        'export default function MDXContent(props) {',
        '  return <_createMdxContent {...props} />',
        '}',
        '',
        '// @ts-ignore',
        '/** @typedef {0 extends 1 & Props ? {} : Props} MDXContentProps */',
        ''
      ),
      typescript: {
        scriptKind: typescript.ScriptKind.JSX
      }
    },
    {
      embeddedFiles: [],
      fileName: '/test.mdx.md',
      languageId: 'markdown',
      mappings: [
        {
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
      ],
      snapshot: snapshotFromLines('')
    }
  ])
})

/**
 * @param {string[]} lines
 * @returns {typescript.IScriptSnapshot}
 */
function snapshotFromLines(...lines) {
  return new ScriptSnapshot(lines.join('\n'))
}
