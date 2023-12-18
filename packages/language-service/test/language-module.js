/**
 * @typedef {import('@volar/language-core').VirtualFile} VirtualFile
 */

import assert from 'node:assert/strict'
import {test} from 'node:test'
import {getLanguageModule} from '@mdx-js/language-service'
import remarkFrontmatter from 'remark-frontmatter'
import typescript from 'typescript'
import {VFileMessage} from 'vfile-message'
import {ScriptSnapshot} from '../lib/script-snapshot.js'
import {VirtualMdxFile} from '../lib/virtual-file.js'

test('create virtual file w/ mdxjsEsm', () => {
  const module = getLanguageModule()

  const snapshot = snapshotFromLines('import {Planet} from "./Planet.js"', '')

  const file = module.createVirtualFile('/test.mdx', 'mdx', snapshot)

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
          generatedOffsets: [0],
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
        'import {Planet} from "./Planet.js"',
        '',
        '/**',
        ' * Render the MDX contents.',
        ' *',
        ' * @param {{readonly [K in keyof MDXContentProps]: MDXContentProps[K]}} props',
        ' *   The [props](https://mdxjs.com/docs/using-mdx/#props) that have been passed to the MDX component.',
        ' */',
        'export default function MDXContent(props) {',
        '  return <></>',
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
  const module = getLanguageModule()

  const snapshot = snapshotFromLines('export {named} from "./Layout.js"', '')

  const file = module.createVirtualFile('/test.mdx', 'mdx', snapshot)

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
          generatedOffsets: [0],
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
        'export {named} from "./Layout.js"',
        '',
        '/**',
        ' * Render the MDX contents.',
        ' *',
        ' * @param {{readonly [K in keyof MDXContentProps]: MDXContentProps[K]}} props',
        ' *   The [props](https://mdxjs.com/docs/using-mdx/#props) that have been passed to the MDX component.',
        ' */',
        'export default function MDXContent(props) {',
        '  return <></>',
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
  const module = getLanguageModule()

  const snapshot = snapshotFromLines('export {default} from "./Layout.js"', '')

  const file = module.createVirtualFile('/test.mdx', 'mdx', snapshot)

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
          generatedOffsets: [0, 8],
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
        'export {} from "./Layout.js"',
        'import {default as MDXLayout} from "./Layout.js"',
        '/**',
        ' * Render the MDX contents.',
        ' *',
        ' * @param {{readonly [K in keyof MDXContentProps]: MDXContentProps[K]}} props',
        ' *   The [props](https://mdxjs.com/docs/using-mdx/#props) that have been passed to the MDX component.',
        ' */',
        'export default function MDXContent(props) {',
        '  return <></>',
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
  const module = getLanguageModule()

  const snapshot = snapshotFromLines(
    'export {named, default} from "./Layout.js"',
    ''
  )

  const file = module.createVirtualFile('/test.mdx', 'mdx', snapshot)

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
          generatedOffsets: [0, 15],
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
        'export {named, } from "./Layout.js"',
        'import {default as MDXLayout} from "./Layout.js"',
        '/**',
        ' * Render the MDX contents.',
        ' *',
        ' * @param {{readonly [K in keyof MDXContentProps]: MDXContentProps[K]}} props',
        ' *   The [props](https://mdxjs.com/docs/using-mdx/#props) that have been passed to the MDX component.',
        ' */',
        'export default function MDXContent(props) {',
        '  return <></>',
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
  const module = getLanguageModule()

  const snapshot = snapshotFromLines(
    'export {default, named} from "./Layout.js"',
    ''
  )

  const file = module.createVirtualFile('/test.mdx', 'mdx', snapshot)

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
          generatedOffsets: [0, 8],
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
        'export { named} from "./Layout.js"',
        'import {default as MDXLayout} from "./Layout.js"',
        '/**',
        ' * Render the MDX contents.',
        ' *',
        ' * @param {{readonly [K in keyof MDXContentProps]: MDXContentProps[K]}} props',
        ' *   The [props](https://mdxjs.com/docs/using-mdx/#props) that have been passed to the MDX component.',
        ' */',
        'export default function MDXContent(props) {',
        '  return <></>',
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
  const module = getLanguageModule()

  const snapshot = snapshotFromLines('export default () => {}', '')

  const file = module.createVirtualFile('/test.mdx', 'mdx', snapshot)

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
          generatedOffsets: [670],
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
        ' * Render the MDX contents.',
        ' *',
        ' * @param {{readonly [K in keyof MDXContentProps]: MDXContentProps[K]}} props',
        ' *   The [props](https://mdxjs.com/docs/using-mdx/#props) that have been passed to the MDX component.',
        ' */',
        'export default function MDXContent(props) {',
        '  return <></>',
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
  const module = getLanguageModule()

  const snapshot = snapshotFromLines(
    'export default function MDXLayout() {}',
    ''
  )

  const file = module.createVirtualFile('/test.mdx', 'mdx', snapshot)

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
          generatedOffsets: [670],
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
        ' * Render the MDX contents.',
        ' *',
        ' * @param {{readonly [K in keyof MDXContentProps]: MDXContentProps[K]}} props',
        ' *   The [props](https://mdxjs.com/docs/using-mdx/#props) that have been passed to the MDX component.',
        ' */',
        'export default function MDXContent(props) {',
        '  return <></>',
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
  const module = getLanguageModule()

  const snapshot = snapshotFromLines('export default "main"', '')

  const file = module.createVirtualFile('/test.mdx', 'mdx', snapshot)

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
          generatedOffsets: [19],
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
        '',
        'const MDXLayout = "main"',
        '',
        '/**',
        ' * Render the MDX contents.',
        ' *',
        ' * @param {{readonly [K in keyof MDXContentProps]: MDXContentProps[K]}} props',
        ' *   The [props](https://mdxjs.com/docs/using-mdx/#props) that have been passed to the MDX component.',
        ' */',
        'export default function MDXContent(props) {',
        '  return <></>',
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
  const module = getLanguageModule()

  const snapshot = snapshotFromLines(
    'export default function MDXLayout(properties) {}',
    ''
  )

  const file = module.createVirtualFile('/test.mdx', 'mdx', snapshot)

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
          generatedOffsets: [675],
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
        ' * Render the MDX contents.',
        ' *',
        ' * @param {{readonly [K in keyof MDXContentProps]: MDXContentProps[K]}} props',
        ' *   The [props](https://mdxjs.com/docs/using-mdx/#props) that have been passed to the MDX component.',
        ' */',
        'export default function MDXContent(props) {',
        '  return <></>',
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
  const module = getLanguageModule()

  const snapshot = snapshotFromLines(
    'export default function MDXLayout() {}',
    'export function named() {}',
    ''
  )

  const file = module.createVirtualFile('/test.mdx', 'mdx', snapshot)

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
          generatedOffsets: [670, 694],
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
        ' * Render the MDX contents.',
        ' *',
        ' * @param {{readonly [K in keyof MDXContentProps]: MDXContentProps[K]}} props',
        ' *   The [props](https://mdxjs.com/docs/using-mdx/#props) that have been passed to the MDX component.',
        ' */',
        'export default function MDXContent(props) {',
        '  return <></>',
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
  const module = getLanguageModule()

  const snapshot = snapshotFromLines(
    'export function named() {}',
    'export default function MDXLayout() {}',
    ''
  )

  const file = module.createVirtualFile('/test.mdx', 'mdx', snapshot)

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
          generatedOffsets: [0, 697],
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
        ' * Render the MDX contents.',
        ' *',
        ' * @param {{readonly [K in keyof MDXContentProps]: MDXContentProps[K]}} props',
        ' *   The [props](https://mdxjs.com/docs/using-mdx/#props) that have been passed to the MDX component.',
        ' */',
        'export default function MDXContent(props) {',
        '  return <></>',
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
  const module = getLanguageModule()

  const snapshot = snapshotFromLines('{Math.PI}', '')

  const file = module.createVirtualFile('/test.mdx', 'mdx', snapshot)

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
          generatedOffsets: [275],
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
        '',
        '/**',
        ' * Render the MDX contents.',
        ' *',
        ' * @param {{readonly [K in keyof MDXContentProps]: MDXContentProps[K]}} props',
        ' *   The [props](https://mdxjs.com/docs/using-mdx/#props) that have been passed to the MDX component.',
        ' */',
        'export default function MDXContent(props) {',
        '  return <>{Math.PI}</>',
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
  const module = getLanguageModule()

  const snapshot = snapshotFromLines(
    '<div>',
    '',
    '  This content should not be part of the JSX embed',
    '',
    '</div>',
    ''
  )

  const file = module.createVirtualFile('/test.mdx', 'mdx', snapshot)

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
          generatedOffsets: [275, 293],
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
        '',
        '/**',
        ' * Render the MDX contents.',
        ' *',
        ' * @param {{readonly [K in keyof MDXContentProps]: MDXContentProps[K]}} props',
        ' *   The [props](https://mdxjs.com/docs/using-mdx/#props) that have been passed to the MDX component.',
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
  const module = getLanguageModule()

  const snapshot = snapshotFromLines('<div />', '')

  const file = module.createVirtualFile('/test.mdx', 'mdx', snapshot)

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
          generatedOffsets: [275],
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
        '',
        '/**',
        ' * Render the MDX contents.',
        ' *',
        ' * @param {{readonly [K in keyof MDXContentProps]: MDXContentProps[K]}} props',
        ' *   The [props](https://mdxjs.com/docs/using-mdx/#props) that have been passed to the MDX component.',
        ' */',
        'export default function MDXContent(props) {',
        '  return <><div /></>',
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
  const module = getLanguageModule()

  const snapshot = snapshotFromLines('A <div />', '')

  const file = module.createVirtualFile('/test.mdx', 'mdx', snapshot)

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
          generatedOffsets: [281],
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
        '',
        '/**',
        ' * Render the MDX contents.',
        ' *',
        ' * @param {{readonly [K in keyof MDXContentProps]: MDXContentProps[K]}} props',
        ' *   The [props](https://mdxjs.com/docs/using-mdx/#props) that have been passed to the MDX component.',
        ' */',
        'export default function MDXContent(props) {',
        "  return <><>{''}<div /></></>",
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
  const module = getLanguageModule()

  const snapshot = snapshotFromLines('3 < {Math.PI} < 4', '')

  const file = module.createVirtualFile('/test.mdx', 'mdx', snapshot)

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
          generatedOffsets: [281],
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
        '',
        '/**',
        ' * Render the MDX contents.',
        ' *',
        ' * @param {{readonly [K in keyof MDXContentProps]: MDXContentProps[K]}} props',
        ' *   The [props](https://mdxjs.com/docs/using-mdx/#props) that have been passed to the MDX component.',
        ' */',
        'export default function MDXContent(props) {',
        "  return <><>{''}{Math.PI}{''}</></>",
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

test('create virtual file w/ dedented markdown content', () => {
  const module = getLanguageModule()

  const snapshot = snapshotFromLines(
    '     | Language |',
    ' | --- |',
    '            | MDX |',
    '     | JavaScript |',
    '| TypeScript |'
  )

  const file = module.createVirtualFile('/test.mdx', 'mdx', snapshot)

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
        '',
        '/**',
        ' * Render the MDX contents.',
        ' *',
        ' * @param {{readonly [K in keyof MDXContentProps]: MDXContentProps[K]}} props',
        ' *   The [props](https://mdxjs.com/docs/using-mdx/#props) that have been passed to the MDX component.',
        ' */',
        'export default function MDXContent(props) {',
        "  return <><>{''}</></>",
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
  const module = getLanguageModule()

  const snapshot = snapshotFromLines('<', '')

  const file = module.createVirtualFile('/test.mdx', 'mdx', snapshot)

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
        '',
        '/**',
        ' * Render the MDX contents.',
        ' *',
        ' * @param {{readonly [K in keyof MDXContentProps]: MDXContentProps[K]}} props',
        ' *   The [props](https://mdxjs.com/docs/using-mdx/#props) that have been passed to the MDX component.',
        ' */',
        'export default function MDXContent(props) {',
        '  return <></>',
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
  const module = getLanguageModule([remarkFrontmatter])

  const snapshot = snapshotFromLines('---', 'hello: frontmatter', '---', '')

  const file = module.createVirtualFile('/test.mdx', 'mdx', snapshot)

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
        '',
        '/**',
        ' * Render the MDX contents.',
        ' *',
        ' * @param {{readonly [K in keyof MDXContentProps]: MDXContentProps[K]}} props',
        ' *   The [props](https://mdxjs.com/docs/using-mdx/#props) that have been passed to the MDX component.',
        ' */',
        'export default function MDXContent(props) {',
        '  return <></>',
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
  const module = getLanguageModule()

  const file = module.createVirtualFile(
    '/test.mdx',
    'mdx',
    snapshotFromLines('Tihs lne haz tyops', '')
  )

  assert.ok(file instanceof VirtualMdxFile)

  const snapshot = snapshotFromLines('This line is fixed', '')
  module.updateVirtualFile(file, snapshot)

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
        '',
        '/**',
        ' * Render the MDX contents.',
        ' *',
        ' * @param {{readonly [K in keyof MDXContentProps]: MDXContentProps[K]}} props',
        ' *   The [props](https://mdxjs.com/docs/using-mdx/#props) that have been passed to the MDX component.',
        ' */',
        'export default function MDXContent(props) {',
        "  return <><>{''}</></>",
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
  const module = getLanguageModule()

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
  const module = getLanguageModule()

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
  return new ScriptSnapshot(lines.join('\n'))
}
