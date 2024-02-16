/**
 * @typedef {import('@volar/language-service').VirtualCode} VirtualCode
 */

import assert from 'node:assert/strict'
import {test} from 'node:test'
import {createMdxLanguagePlugin} from '@mdx-js/language-service'
import remarkFrontmatter from 'remark-frontmatter'
import typescript from 'typescript'
import {VFileMessage} from 'vfile-message'
import {ScriptSnapshot} from '../lib/script-snapshot.js'
import {VirtualMdxCode} from '../lib/virtual-code.js'

test('create virtual code w/ mdxjsEsm', () => {
  const plugin = createMdxLanguagePlugin()

  const snapshot = snapshotFromLines('import {Planet} from "./Planet.js"', '')

  const code = plugin.createVirtualCode('/test.mdx', 'mdx', snapshot)

  assert.ok(code instanceof VirtualMdxCode)
  assert.equal(code.id, 'mdx')
  assert.equal(code.languageId, 'mdx')
  assert.ifError(code.error)
  assert.equal(code.snapshot, snapshot)
  assert.deepEqual(code.mappings, [
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
  assert.deepEqual(code.embeddedCodes, [
    {
      embeddedCodes: [],
      id: 'jsx',
      languageId: 'javascriptreact',
      mappings: [
        {
          sourceOffsets: [0],
          generatedOffsets: [51],
          lengths: [35],
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
        '',
        '/**',
        ' * @deprecated',
        ' *   Do not use.',
        ' *',
        ' * @param {{readonly [K in keyof MDXContentProps]: MDXContentProps[K]}} props',
        ' *   The [props](https://mdxjs.com/docs/using-mdx/#props) that have been passed to the MDX component.',
        ' */',
        'function _createMdxContent(props) {',
        '  /**',
        '   * @internal',
        '   *   **Do not use.** This is an MDX internal.',
        '   */',
        '  const _components = {',
        '    ...props.components,',
        '    /** The [props](https://mdxjs.com/docs/using-mdx/#props) that have been passed to the MDX component. */',
        '    props,',
        '    /** {@link Planet} */',
        '    Planet',
        '  }',
        '  return <>',
        '  </>',
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
        '/** @typedef {(0 extends 1 & Props ? {} : Props) & {components?: {}}} MDXContentProps */',
        ''
      )
    },
    {
      embeddedCodes: [],
      id: 'md',
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

test('create virtual code w/o MDX layout in case of named re-export', () => {
  const plugin = createMdxLanguagePlugin()

  const snapshot = snapshotFromLines('export {named} from "./Layout.js"', '')

  const code = plugin.createVirtualCode('/test.mdx', 'mdx', snapshot)

  assert.ok(code instanceof VirtualMdxCode)
  assert.equal(code.id, 'mdx')
  assert.equal(code.languageId, 'mdx')
  assert.ifError(code.error)
  assert.equal(code.snapshot, snapshot)
  assert.deepEqual(code.mappings, [
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
  assert.deepEqual(code.embeddedCodes, [
    {
      embeddedCodes: [],
      id: 'jsx',
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
        'export {named} from "./Layout.js"',
        '',
        '',
        '/**',
        ' * @deprecated',
        ' *   Do not use.',
        ' *',
        ' * @param {{readonly [K in keyof MDXContentProps]: MDXContentProps[K]}} props',
        ' *   The [props](https://mdxjs.com/docs/using-mdx/#props) that have been passed to the MDX component.',
        ' */',
        'function _createMdxContent(props) {',
        '  /**',
        '   * @internal',
        '   *   **Do not use.** This is an MDX internal.',
        '   */',
        '  const _components = {',
        '    ...props.components,',
        '    /** The [props](https://mdxjs.com/docs/using-mdx/#props) that have been passed to the MDX component. */',
        '    props',
        '  }',
        '  return <>',
        '  </>',
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
        '/** @typedef {(0 extends 1 & Props ? {} : Props) & {components?: {}}} MDXContentProps */',
        ''
      )
    },
    {
      embeddedCodes: [],
      id: 'md',
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

test('create virtual code w/ MDX layout in case of default re-export', () => {
  const plugin = createMdxLanguagePlugin()

  const snapshot = snapshotFromLines('export {default} from "./Layout.js"', '')

  const code = plugin.createVirtualCode('/test.mdx', 'mdx', snapshot)

  assert.ok(code instanceof VirtualMdxCode)
  assert.equal(code.id, 'mdx')
  assert.equal(code.languageId, 'mdx')
  assert.ifError(code.error)
  assert.equal(code.snapshot, snapshot)
  assert.deepEqual(code.mappings, [
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
  assert.deepEqual(code.embeddedCodes, [
    {
      embeddedCodes: [],
      id: 'jsx',
      languageId: 'javascriptreact',
      mappings: [
        {
          sourceOffsets: [0, 15],
          generatedOffsets: [51, 59],
          lengths: [8, 21],
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
        '',
        'import {default as MDXLayout} from "./Layout.js"',
        '',
        '/**',
        ' * @deprecated',
        ' *   Do not use.',
        ' *',
        ' * @param {{readonly [K in keyof MDXContentProps]: MDXContentProps[K]}} props',
        ' *   The [props](https://mdxjs.com/docs/using-mdx/#props) that have been passed to the MDX component.',
        ' */',
        'function _createMdxContent(props) {',
        '  /**',
        '   * @internal',
        '   *   **Do not use.** This is an MDX internal.',
        '   */',
        '  const _components = {',
        '    ...props.components,',
        '    /** The [props](https://mdxjs.com/docs/using-mdx/#props) that have been passed to the MDX component. */',
        '    props',
        '  }',
        '  return <>',
        '  </>',
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
        '/** @typedef {(0 extends 1 & Props ? {} : Props) & {components?: {}}} MDXContentProps */',
        ''
      )
    },
    {
      embeddedCodes: [],
      id: 'md',
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

test('create virtual code w/ MDX layout in case of named and default re-export', () => {
  const plugin = createMdxLanguagePlugin()

  const snapshot = snapshotFromLines(
    'export {named, default} from "./Layout.js"',
    ''
  )

  const code = plugin.createVirtualCode('/test.mdx', 'mdx', snapshot)

  assert.ok(code instanceof VirtualMdxCode)
  assert.equal(code.id, 'mdx')
  assert.equal(code.languageId, 'mdx')
  assert.ifError(code.error)
  assert.equal(code.snapshot, snapshot)
  assert.deepEqual(code.mappings, [
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
  assert.deepEqual(code.embeddedCodes, [
    {
      embeddedCodes: [],
      id: 'jsx',
      languageId: 'javascriptreact',
      mappings: [
        {
          sourceOffsets: [0, 22],
          generatedOffsets: [51, 66],
          lengths: [15, 21],
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
        '',
        'import {default as MDXLayout} from "./Layout.js"',
        '',
        '/**',
        ' * @deprecated',
        ' *   Do not use.',
        ' *',
        ' * @param {{readonly [K in keyof MDXContentProps]: MDXContentProps[K]}} props',
        ' *   The [props](https://mdxjs.com/docs/using-mdx/#props) that have been passed to the MDX component.',
        ' */',
        'function _createMdxContent(props) {',
        '  /**',
        '   * @internal',
        '   *   **Do not use.** This is an MDX internal.',
        '   */',
        '  const _components = {',
        '    ...props.components,',
        '    /** The [props](https://mdxjs.com/docs/using-mdx/#props) that have been passed to the MDX component. */',
        '    props',
        '  }',
        '  return <>',
        '  </>',
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
        '/** @typedef {(0 extends 1 & Props ? {} : Props) & {components?: {}}} MDXContentProps */',
        ''
      )
    },
    {
      embeddedCodes: [],
      id: 'md',
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

test('create virtual code w/ MDX layout in case of default and named re-export', () => {
  const plugin = createMdxLanguagePlugin()

  const snapshot = snapshotFromLines(
    'export {default, named} from "./Layout.js"',
    ''
  )

  const code = plugin.createVirtualCode('/test.mdx', 'mdx', snapshot)

  assert.ok(code instanceof VirtualMdxCode)
  assert.equal(code.id, 'mdx')
  assert.equal(code.languageId, 'mdx')
  assert.ifError(code.error)
  assert.equal(code.snapshot, snapshot)
  assert.deepEqual(code.mappings, [
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
  assert.deepEqual(code.embeddedCodes, [
    {
      embeddedCodes: [],
      id: 'jsx',
      languageId: 'javascriptreact',
      mappings: [
        {
          sourceOffsets: [0, 16],
          generatedOffsets: [51, 59],
          lengths: [8, 27],
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
        '',
        'import {default as MDXLayout} from "./Layout.js"',
        '',
        '/**',
        ' * @deprecated',
        ' *   Do not use.',
        ' *',
        ' * @param {{readonly [K in keyof MDXContentProps]: MDXContentProps[K]}} props',
        ' *   The [props](https://mdxjs.com/docs/using-mdx/#props) that have been passed to the MDX component.',
        ' */',
        'function _createMdxContent(props) {',
        '  /**',
        '   * @internal',
        '   *   **Do not use.** This is an MDX internal.',
        '   */',
        '  const _components = {',
        '    ...props.components,',
        '    /** The [props](https://mdxjs.com/docs/using-mdx/#props) that have been passed to the MDX component. */',
        '    props',
        '  }',
        '  return <>',
        '  </>',
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
        '/** @typedef {(0 extends 1 & Props ? {} : Props) & {components?: {}}} MDXContentProps */',
        ''
      )
    },
    {
      embeddedCodes: [],
      id: 'md',
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

test('create virtual code w/ MDX layout in case of a default exported arrow function', () => {
  const plugin = createMdxLanguagePlugin()

  const snapshot = snapshotFromLines('export default () => {}', '')

  const code = plugin.createVirtualCode('/test.mdx', 'mdx', snapshot)

  assert.ok(code instanceof VirtualMdxCode)
  assert.equal(code.id, 'mdx')
  assert.equal(code.languageId, 'mdx')
  assert.ifError(code.error)
  assert.equal(code.snapshot, snapshot)
  assert.deepEqual(code.mappings, [
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
  assert.deepEqual(code.embeddedCodes, [
    {
      embeddedCodes: [],
      id: 'jsx',
      languageId: 'javascriptreact',
      mappings: [
        {
          sourceOffsets: [15],
          generatedOffsets: [721],
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
        '',
        '/**',
        ' * @deprecated',
        ' *   Do not use.',
        ' *',
        ' * @param {{readonly [K in keyof MDXContentProps]: MDXContentProps[K]}} props',
        ' *   The [props](https://mdxjs.com/docs/using-mdx/#props) that have been passed to the MDX component.',
        ' */',
        'function _createMdxContent(props) {',
        '  /**',
        '   * @internal',
        '   *   **Do not use.** This is an MDX internal.',
        '   */',
        '  const _components = {',
        '    ...props.components,',
        '    /** The [props](https://mdxjs.com/docs/using-mdx/#props) that have been passed to the MDX component. */',
        '    props',
        '  }',
        '  return <>',
        '  </>',
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
        '/** @typedef {(0 extends 1 & Props ? {} : Props) & {components?: {}}} MDXContentProps */',
        ''
      )
    },
    {
      embeddedCodes: [],
      id: 'md',
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

test('create virtual code w/ MDX layout in case of a default exported function declaration', () => {
  const plugin = createMdxLanguagePlugin()

  const snapshot = snapshotFromLines(
    'export default function MDXLayout() {}',
    ''
  )

  const code = plugin.createVirtualCode('/test.mdx', 'mdx', snapshot)

  assert.ok(code instanceof VirtualMdxCode)
  assert.equal(code.id, 'mdx')
  assert.equal(code.languageId, 'mdx')
  assert.ifError(code.error)
  assert.equal(code.snapshot, snapshot)
  assert.deepEqual(code.mappings, [
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
  assert.deepEqual(code.embeddedCodes, [
    {
      embeddedCodes: [],
      id: 'jsx',
      languageId: 'javascriptreact',
      mappings: [
        {
          sourceOffsets: [15],
          generatedOffsets: [721],
          lengths: [24],
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
        '',
        '/**',
        ' * @deprecated',
        ' *   Do not use.',
        ' *',
        ' * @param {{readonly [K in keyof MDXContentProps]: MDXContentProps[K]}} props',
        ' *   The [props](https://mdxjs.com/docs/using-mdx/#props) that have been passed to the MDX component.',
        ' */',
        'function _createMdxContent(props) {',
        '  /**',
        '   * @internal',
        '   *   **Do not use.** This is an MDX internal.',
        '   */',
        '  const _components = {',
        '    ...props.components,',
        '    /** The [props](https://mdxjs.com/docs/using-mdx/#props) that have been passed to the MDX component. */',
        '    props,',
        '    /** {@link MDXLayout} */',
        '    MDXLayout',
        '  }',
        '  return <>',
        '  </>',
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
        '/** @typedef {(0 extends 1 & Props ? {} : Props) & {components?: {}}} MDXContentProps */',
        ''
      )
    },
    {
      embeddedCodes: [],
      id: 'md',
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

test('create virtual code w/ MDX layout in case of a default exported constant', () => {
  const plugin = createMdxLanguagePlugin()

  const snapshot = snapshotFromLines('export default "main"', '')

  const code = plugin.createVirtualCode('/test.mdx', 'mdx', snapshot)

  assert.ok(code instanceof VirtualMdxCode)
  assert.equal(code.id, 'mdx')
  assert.equal(code.languageId, 'mdx')
  assert.ifError(code.error)
  assert.equal(code.snapshot, snapshot)
  assert.deepEqual(code.mappings, [
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
  assert.deepEqual(code.embeddedCodes, [
    {
      embeddedCodes: [],
      id: 'jsx',
      languageId: 'javascriptreact',
      mappings: [
        {
          sourceOffsets: [15],
          generatedOffsets: [70],
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
        'const MDXLayout = "main"',
        '',
        '',
        '/**',
        ' * @deprecated',
        ' *   Do not use.',
        ' *',
        ' * @param {{readonly [K in keyof MDXContentProps]: MDXContentProps[K]}} props',
        ' *   The [props](https://mdxjs.com/docs/using-mdx/#props) that have been passed to the MDX component.',
        ' */',
        'function _createMdxContent(props) {',
        '  /**',
        '   * @internal',
        '   *   **Do not use.** This is an MDX internal.',
        '   */',
        '  const _components = {',
        '    ...props.components,',
        '    /** The [props](https://mdxjs.com/docs/using-mdx/#props) that have been passed to the MDX component. */',
        '    props',
        '  }',
        '  return <>',
        '  </>',
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
        '/** @typedef {(0 extends 1 & Props ? {} : Props) & {components?: {}}} MDXContentProps */',
        ''
      )
    },
    {
      embeddedCodes: [],
      id: 'md',
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

test('create virtual code w/ MDX layout and matching argument name', () => {
  const plugin = createMdxLanguagePlugin()

  const snapshot = snapshotFromLines(
    'export default function MDXLayout(properties) {}',
    ''
  )

  const code = plugin.createVirtualCode('/test.mdx', 'mdx', snapshot)

  assert.ok(code instanceof VirtualMdxCode)
  assert.equal(code.id, 'mdx')
  assert.equal(code.languageId, 'mdx')
  assert.ifError(code.error)
  assert.equal(code.snapshot, snapshot)
  assert.deepEqual(code.mappings, [
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
  assert.deepEqual(code.embeddedCodes, [
    {
      embeddedCodes: [],
      id: 'jsx',
      languageId: 'javascriptreact',
      mappings: [
        {
          sourceOffsets: [15],
          generatedOffsets: [726],
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
        '',
        '/**',
        ' * @deprecated',
        ' *   Do not use.',
        ' *',
        ' * @param {{readonly [K in keyof MDXContentProps]: MDXContentProps[K]}} props',
        ' *   The [props](https://mdxjs.com/docs/using-mdx/#props) that have been passed to the MDX component.',
        ' */',
        'function _createMdxContent(props) {',
        '  /**',
        '   * @internal',
        '   *   **Do not use.** This is an MDX internal.',
        '   */',
        '  const _components = {',
        '    ...props.components,',
        '    /** The [props](https://mdxjs.com/docs/using-mdx/#props) that have been passed to the MDX component. */',
        '    props,',
        '    /** {@link MDXLayout} */',
        '    MDXLayout',
        '  }',
        '  return <>',
        '  </>',
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
        '/** @typedef {(0 extends 1 & Props ? {} : Props) & {components?: {}}} MDXContentProps */',
        ''
      )
    },
    {
      embeddedCodes: [],
      id: 'md',
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

test('create virtual code w/ MDX layout in case of a default export followed by a named', () => {
  const plugin = createMdxLanguagePlugin()

  const snapshot = snapshotFromLines(
    'export default function MDXLayout() {}',
    'export function named() {}',
    ''
  )

  const code = plugin.createVirtualCode('/test.mdx', 'mdx', snapshot)

  assert.ok(code instanceof VirtualMdxCode)
  assert.equal(code.id, 'mdx')
  assert.equal(code.languageId, 'mdx')
  assert.ifError(code.error)
  assert.equal(code.snapshot, snapshot)
  assert.deepEqual(code.mappings, [
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
  assert.deepEqual(code.embeddedCodes, [
    {
      embeddedCodes: [],
      id: 'jsx',
      languageId: 'javascriptreact',
      mappings: [
        {
          sourceOffsets: [15],
          generatedOffsets: [721],
          lengths: [51],
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
        '',
        '/**',
        ' * @deprecated',
        ' *   Do not use.',
        ' *',
        ' * @param {{readonly [K in keyof MDXContentProps]: MDXContentProps[K]}} props',
        ' *   The [props](https://mdxjs.com/docs/using-mdx/#props) that have been passed to the MDX component.',
        ' */',
        'function _createMdxContent(props) {',
        '  /**',
        '   * @internal',
        '   *   **Do not use.** This is an MDX internal.',
        '   */',
        '  const _components = {',
        '    ...props.components,',
        '    /** The [props](https://mdxjs.com/docs/using-mdx/#props) that have been passed to the MDX component. */',
        '    props,',
        '    /** {@link MDXLayout} */',
        '    MDXLayout,',
        '    /** {@link named} */',
        '    named',
        '  }',
        '  return <>',
        '  </>',
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
        '/** @typedef {(0 extends 1 & Props ? {} : Props) & {components?: {}}} MDXContentProps */',
        ''
      )
    },
    {
      embeddedCodes: [],
      id: 'md',
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

test('create virtual code w/ MDX layout in case of a default export preceded by a named', () => {
  const plugin = createMdxLanguagePlugin()

  const snapshot = snapshotFromLines(
    'export function named() {}',
    'export default function MDXLayout() {}',
    ''
  )

  const code = plugin.createVirtualCode('/test.mdx', 'mdx', snapshot)

  assert.ok(code instanceof VirtualMdxCode)
  assert.equal(code.id, 'mdx')
  assert.equal(code.languageId, 'mdx')
  assert.ifError(code.error)
  assert.equal(code.snapshot, snapshot)
  assert.deepEqual(code.mappings, [
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
  assert.deepEqual(code.embeddedCodes, [
    {
      embeddedCodes: [],
      id: 'jsx',
      languageId: 'javascriptreact',
      mappings: [
        {
          sourceOffsets: [0, 42],
          generatedOffsets: [51, 748],
          lengths: [27, 24],
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
        '',
        '/**',
        ' * @deprecated',
        ' *   Do not use.',
        ' *',
        ' * @param {{readonly [K in keyof MDXContentProps]: MDXContentProps[K]}} props',
        ' *   The [props](https://mdxjs.com/docs/using-mdx/#props) that have been passed to the MDX component.',
        ' */',
        'function _createMdxContent(props) {',
        '  /**',
        '   * @internal',
        '   *   **Do not use.** This is an MDX internal.',
        '   */',
        '  const _components = {',
        '    ...props.components,',
        '    /** The [props](https://mdxjs.com/docs/using-mdx/#props) that have been passed to the MDX component. */',
        '    props,',
        '    /** {@link MDXLayout} */',
        '    MDXLayout,',
        '    /** {@link named} */',
        '    named',
        '  }',
        '  return <>',
        '  </>',
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
        '/** @typedef {(0 extends 1 & Props ? {} : Props) & {components?: {}}} MDXContentProps */',
        ''
      )
    },
    {
      embeddedCodes: [],
      id: 'md',
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

test('create virtual code w/ mdxFlowExpression', () => {
  const plugin = createMdxLanguagePlugin()

  const snapshot = snapshotFromLines('{Math.PI}', '')

  const code = plugin.createVirtualCode('/test.mdx', 'mdx', snapshot)

  assert.ok(code instanceof VirtualMdxCode)
  assert.equal(code.id, 'mdx')
  assert.equal(code.languageId, 'mdx')
  assert.ifError(code.error)
  assert.equal(code.snapshot, snapshot)
  assert.deepEqual(code.mappings, [
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
  assert.deepEqual(code.embeddedCodes, [
    {
      embeddedCodes: [],
      id: 'jsx',
      languageId: 'javascriptreact',
      mappings: [
        {
          sourceOffsets: [0],
          generatedOffsets: [573],
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
        '  /**',
        '   * @internal',
        '   *   **Do not use.** This is an MDX internal.',
        '   */',
        '  const _components = {',
        '    ...props.components,',
        '    /** The [props](https://mdxjs.com/docs/using-mdx/#props) that have been passed to the MDX component. */',
        '    props',
        '  }',
        '  return <>',
        '    {Math.PI}',
        '  </>',
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
        '/** @typedef {(0 extends 1 & Props ? {} : Props) & {components?: {}}} MDXContentProps */',
        ''
      )
    },
    {
      embeddedCodes: [],
      id: 'md',
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

test('create virtual code w/ mdxJsxFlowElement w/ children', () => {
  const plugin = createMdxLanguagePlugin()

  const snapshot = snapshotFromLines(
    'export function Local() {}',
    '',
    '<div>',
    '',
    '  This content should not be part of the JSX embed',
    '',
    '</div>',
    '<Injected>',
    '',
    '  This content should not be part of the JSX embed',
    '',
    '</Injected>',
    '<Local>',
    '',
    '  This content should not be part of the JSX embed',
    '',
    '</Local>',
    ''
  )

  const code = plugin.createVirtualCode('/test.mdx', 'mdx', snapshot)

  assert.ok(code instanceof VirtualMdxCode)
  assert.equal(code.id, 'mdx')
  assert.equal(code.languageId, 'mdx')
  assert.ifError(code.error)
  assert.equal(code.snapshot, snapshot)
  assert.deepEqual(code.mappings, [
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
  assert.deepEqual(code.embeddedCodes, [
    {
      embeddedCodes: [],
      id: 'jsx',
      languageId: 'javascriptreact',
      mappings: [
        {
          sourceOffsets: [0],
          generatedOffsets: [51],
          lengths: [27],
          data: {
            completion: true,
            format: false,
            navigation: true,
            semantic: true,
            structure: true,
            verification: true
          }
        },
        {
          sourceOffsets: [28, 87, 94, 95, 158, 160, 170, 231],
          generatedOffsets: [637, 671, 682, 695, 733, 747, 761, 797],
          lengths: [5, 6, 1, 9, 2, 9, 7, 8],
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
        'export function Local() {}',
        '',
        '',
        '/**',
        ' * @deprecated',
        ' *   Do not use.',
        ' *',
        ' * @param {{readonly [K in keyof MDXContentProps]: MDXContentProps[K]}} props',
        ' *   The [props](https://mdxjs.com/docs/using-mdx/#props) that have been passed to the MDX component.',
        ' */',
        'function _createMdxContent(props) {',
        '  /**',
        '   * @internal',
        '   *   **Do not use.** This is an MDX internal.',
        '   */',
        '  const _components = {',
        '    ...props.components,',
        '    /** The [props](https://mdxjs.com/docs/using-mdx/#props) that have been passed to the MDX component. */',
        '    props,',
        '    /** {@link Local} */',
        '    Local',
        '  }',
        '  return <>',
        '    <div>',
        '    <>',
        "    {''}",
        '    </>',
        '    </div>',
        '    <_components.Injected>',
        '    <>',
        "    {''}",
        '    </>',
        '    </_components.Injected>',
        '    <Local>',
        '    <>',
        "    {''}",
        '    </>',
        '    </Local>',
        '  </>',
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
        '/** @typedef {(0 extends 1 & Props ? {} : Props) & {components?: {}}} MDXContentProps */',
        ''
      )
    },
    {
      embeddedCodes: [],
      id: 'md',
      languageId: 'markdown',
      mappings: [
        {
          sourceOffsets: [26, 33, 37, 93, 104, 108, 169, 177, 181, 239],
          generatedOffsets: [0, 9, 11, 68, 76, 78, 135, 143, 145, 202],
          lengths: [2, 2, 50, 1, 2, 50, 1, 2, 50, 1],
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
        '',
        '<!---->',
        '',
        'This content should not be part of the JSX embed',
        '',
        '<!---->',
        '<!---->',
        '',
        'This content should not be part of the JSX embed',
        '',
        '<!---->',
        '<!---->',
        '',
        'This content should not be part of the JSX embed',
        '',
        '<!---->',
        ''
      )
    }
  ])
})

test('create virtual code w/ mdxJsxFlowElement w/o children', () => {
  const plugin = createMdxLanguagePlugin()

  const snapshot = snapshotFromLines(
    'export function Local() {}',
    '',
    '<div />',
    '<Injected />',
    '<Local />',
    ''
  )

  const code = plugin.createVirtualCode('/test.mdx', 'mdx', snapshot)

  assert.ok(code instanceof VirtualMdxCode)
  assert.equal(code.id, 'mdx')
  assert.equal(code.languageId, 'mdx')
  assert.ifError(code.error)
  assert.equal(code.snapshot, snapshot)
  assert.deepEqual(code.mappings, [
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
  assert.deepEqual(code.embeddedCodes, [
    {
      embeddedCodes: [],
      id: 'jsx',
      languageId: 'javascriptreact',
      mappings: [
        {
          sourceOffsets: [0],
          generatedOffsets: [51],
          lengths: [27],
          data: {
            completion: true,
            format: false,
            navigation: true,
            semantic: true,
            structure: true,
            verification: true
          }
        },
        {
          sourceOffsets: [28, 36, 37, 49],
          generatedOffsets: [637, 649, 662, 678],
          lengths: [7, 1, 11, 9],
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
        'export function Local() {}',
        '',
        '',
        '/**',
        ' * @deprecated',
        ' *   Do not use.',
        ' *',
        ' * @param {{readonly [K in keyof MDXContentProps]: MDXContentProps[K]}} props',
        ' *   The [props](https://mdxjs.com/docs/using-mdx/#props) that have been passed to the MDX component.',
        ' */',
        'function _createMdxContent(props) {',
        '  /**',
        '   * @internal',
        '   *   **Do not use.** This is an MDX internal.',
        '   */',
        '  const _components = {',
        '    ...props.components,',
        '    /** The [props](https://mdxjs.com/docs/using-mdx/#props) that have been passed to the MDX component. */',
        '    props,',
        '    /** {@link Local} */',
        '    Local',
        '  }',
        '  return <>',
        '    <div />',
        '    <_components.Injected />',
        '    <Local />',
        '  </>',
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
        '/** @typedef {(0 extends 1 & Props ? {} : Props) & {components?: {}}} MDXContentProps */',
        ''
      )
    },
    {
      embeddedCodes: [],
      id: 'md',
      languageId: 'markdown',
      mappings: [
        {
          sourceOffsets: [26, 35, 48, 58],
          generatedOffsets: [0, 9, 17, 25],
          lengths: [2, 1, 1, 1],
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
      snapshot: snapshotFromLines('', '', '<!---->', '<!---->', '<!---->', '')
    }
  ])
})

test('create virtual code w/ mdxJsxTextElement', () => {
  const plugin = createMdxLanguagePlugin()

  const snapshot = snapshotFromLines(
    'export function Local() {}',
    '',
    'A <div />',
    'An <Injected />',
    'A <Local />',
    ''
  )

  const code = plugin.createVirtualCode('/test.mdx', 'mdx', snapshot)

  assert.ok(code instanceof VirtualMdxCode)
  assert.equal(code.id, 'mdx')
  assert.equal(code.languageId, 'mdx')
  assert.ifError(code.error)
  assert.equal(code.snapshot, snapshot)
  assert.deepEqual(code.mappings, [
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
  assert.deepEqual(code.embeddedCodes, [
    {
      embeddedCodes: [],
      id: 'jsx',
      languageId: 'javascriptreact',
      mappings: [
        {
          sourceOffsets: [0],
          generatedOffsets: [51],
          lengths: [27],
          data: {
            completion: true,
            format: false,
            navigation: true,
            semantic: true,
            structure: true,
            verification: true
          }
        },
        {
          sourceOffsets: [30, 41, 42, 56],
          generatedOffsets: [653, 674, 687, 712],
          lengths: [7, 1, 11, 9],
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
        'export function Local() {}',
        '',
        '',
        '/**',
        ' * @deprecated',
        ' *   Do not use.',
        ' *',
        ' * @param {{readonly [K in keyof MDXContentProps]: MDXContentProps[K]}} props',
        ' *   The [props](https://mdxjs.com/docs/using-mdx/#props) that have been passed to the MDX component.',
        ' */',
        'function _createMdxContent(props) {',
        '  /**',
        '   * @internal',
        '   *   **Do not use.** This is an MDX internal.',
        '   */',
        '  const _components = {',
        '    ...props.components,',
        '    /** The [props](https://mdxjs.com/docs/using-mdx/#props) that have been passed to the MDX component. */',
        '    props,',
        '    /** {@link Local} */',
        '    Local',
        '  }',
        '  return <>',
        '    <>',
        "    {''}",
        '    <div />',
        "    {''}",
        '    <_components.Injected />',
        "    {''}",
        '    <Local />',
        '    </>',
        '  </>',
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
        '/** @typedef {(0 extends 1 & Props ? {} : Props) & {components?: {}}} MDXContentProps */',
        ''
      )
    },
    {
      embeddedCodes: [],
      id: 'md',
      languageId: 'markdown',
      mappings: [
        {
          sourceOffsets: [26, 37, 53, 65],
          generatedOffsets: [0, 11, 22, 32],
          lengths: [4, 4, 3, 1],
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
        '',
        'A <!---->',
        'An <!---->',
        'A <!---->',
        ''
      )
    }
  ])
})

test('create virtual code w/ mdxTextExpression', () => {
  const plugin = createMdxLanguagePlugin()

  const snapshot = snapshotFromLines('3 < {Math.PI} < 4', '')

  const code = plugin.createVirtualCode('/test.mdx', 'mdx', snapshot)

  assert.ok(code instanceof VirtualMdxCode)
  assert.equal(code.id, 'mdx')
  assert.equal(code.languageId, 'mdx')
  assert.ifError(code.error)
  assert.equal(code.snapshot, snapshot)
  assert.deepEqual(code.mappings, [
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
  assert.deepEqual(code.embeddedCodes, [
    {
      embeddedCodes: [],
      id: 'jsx',
      languageId: 'javascriptreact',
      mappings: [
        {
          generatedOffsets: [589],
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
        '  /**',
        '   * @internal',
        '   *   **Do not use.** This is an MDX internal.',
        '   */',
        '  const _components = {',
        '    ...props.components,',
        '    /** The [props](https://mdxjs.com/docs/using-mdx/#props) that have been passed to the MDX component. */',
        '    props',
        '  }',
        '  return <>',
        '    <>',
        "    {''}",
        '    {Math.PI}',
        "    {''}",
        '    </>',
        '  </>',
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
        '/** @typedef {(0 extends 1 & Props ? {} : Props) & {components?: {}}} MDXContentProps */',
        ''
      )
    },
    {
      embeddedCodes: [],
      id: 'md',
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

test('create virtual code w/ async mdxTextExpression', () => {
  const plugin = createMdxLanguagePlugin()

  const snapshot = snapshotFromLines(
    '3 < {await Promise.resolve(Math.PI)} < 4',
    ''
  )

  const code = plugin.createVirtualCode('/test.mdx', 'mdx', snapshot)

  assert.ok(code instanceof VirtualMdxCode)
  assert.equal(code.id, 'mdx')
  assert.equal(code.languageId, 'mdx')
  assert.ifError(code.error)
  assert.equal(code.snapshot, snapshot)
  assert.deepEqual(code.mappings, [
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
  assert.deepEqual(code.embeddedCodes, [
    {
      embeddedCodes: [],
      id: 'jsx',
      languageId: 'javascriptreact',
      mappings: [
        {
          generatedOffsets: [595],
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
        '  /**',
        '   * @internal',
        '   *   **Do not use.** This is an MDX internal.',
        '   */',
        '  const _components = {',
        '    ...props.components,',
        '    /** The [props](https://mdxjs.com/docs/using-mdx/#props) that have been passed to the MDX component. */',
        '    props',
        '  }',
        '  return <>',
        '    <>',
        "    {''}",
        '    {await Promise.resolve(Math.PI)}',
        "    {''}",
        '    </>',
        '  </>',
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
        '/** @typedef {(0 extends 1 & Props ? {} : Props) & {components?: {}}} MDXContentProps */',
        ''
      )
    },
    {
      embeddedCodes: [],
      id: 'md',
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

test('create virtual code w/ dedented markdown content', () => {
  const plugin = createMdxLanguagePlugin()

  const snapshot = snapshotFromLines(
    '     | Language |',
    ' | --- |',
    '            | MDX |',
    '     | JavaScript |',
    '| TypeScript |'
  )

  const code = plugin.createVirtualCode('/test.mdx', 'mdx', snapshot)

  assert.ok(code instanceof VirtualMdxCode)
  assert.equal(code.id, 'mdx')
  assert.equal(code.languageId, 'mdx')
  assert.ifError(code.error)
  assert.equal(code.snapshot, snapshot)
  assert.deepEqual(code.mappings, [
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
  assert.deepEqual(code.embeddedCodes, [
    {
      embeddedCodes: [],
      id: 'jsx',
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
        '  /**',
        '   * @internal',
        '   *   **Do not use.** This is an MDX internal.',
        '   */',
        '  const _components = {',
        '    ...props.components,',
        '    /** The [props](https://mdxjs.com/docs/using-mdx/#props) that have been passed to the MDX component. */',
        '    props',
        '  }',
        '  return <>',
        '    <>',
        "    {''}",
        '    </>',
        '  </>',
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
        '/** @typedef {(0 extends 1 & Props ? {} : Props) & {components?: {}}} MDXContentProps */',
        ''
      )
    },
    {
      embeddedCodes: [],
      id: 'md',
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

test('create virtual code w/ syntax error', () => {
  const plugin = createMdxLanguagePlugin()

  const snapshot = snapshotFromLines('<', '')

  const code = plugin.createVirtualCode('/test.mdx', 'mdx', snapshot)

  assert.ok(code instanceof VirtualMdxCode)
  assert.equal(code.id, 'mdx')
  assert.equal(code.languageId, 'mdx')
  assert.ok(code.error instanceof VFileMessage)
  assert.equal(code.snapshot, snapshot)
  assert.deepEqual(code.mappings, [
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
  assert.deepEqual(code.embeddedCodes, [
    {
      embeddedCodes: [],
      id: 'jsx',
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
        '  /**',
        '   * @internal',
        '   *   **Do not use.** This is an MDX internal.',
        '   */',
        '  const _components = {',
        '    ...props.components,',
        '    /** The [props](https://mdxjs.com/docs/using-mdx/#props) that have been passed to the MDX component. */',
        '    props',
        '  }',
        '  return <>',
        '  </>',
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
        '/** @typedef {(0 extends 1 & Props ? {} : Props) & {components?: {}}} MDXContentProps */',
        ''
      )
    },
    {
      embeddedCodes: [],
      id: 'md',
      languageId: 'markdown',
      mappings: [],
      snapshot: snapshotFromLines('<', '')
    }
  ])
})

test('create virtual code w/ yaml frontmatter', () => {
  const plugin = createMdxLanguagePlugin([remarkFrontmatter])

  const snapshot = snapshotFromLines('---', 'hello: frontmatter', '---', '')

  const code = plugin.createVirtualCode('/test.mdx', 'mdx', snapshot)

  assert.ok(code instanceof VirtualMdxCode)
  assert.equal(code.id, 'mdx')
  assert.equal(code.languageId, 'mdx')
  assert.ifError(code.error)
  assert.equal(code.snapshot, snapshot)
  assert.deepEqual(code.mappings, [
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
  assert.deepEqual(code.embeddedCodes, [
    {
      embeddedCodes: [],
      id: 'jsx',
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
        '  /**',
        '   * @internal',
        '   *   **Do not use.** This is an MDX internal.',
        '   */',
        '  const _components = {',
        '    ...props.components,',
        '    /** The [props](https://mdxjs.com/docs/using-mdx/#props) that have been passed to the MDX component. */',
        '    props',
        '  }',
        '  return <>',
        '  </>',
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
        '/** @typedef {(0 extends 1 & Props ? {} : Props) & {components?: {}}} MDXContentProps */',
        ''
      )
    },
    {
      embeddedCodes: [],
      id: 'md',
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
      embeddedCodes: [],
      id: 'yaml',
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

test('update virtual code', () => {
  const plugin = createMdxLanguagePlugin()

  const code = plugin.createVirtualCode(
    '/test.mdx',
    'mdx',
    snapshotFromLines('Tihs lne haz tyops', '')
  )

  assert.ok(code instanceof VirtualMdxCode)

  const snapshot = snapshotFromLines('This line is fixed', '')
  plugin.updateVirtualCode('/text.mdx', code, snapshot)

  assert.equal(code.id, 'mdx')
  assert.equal(code.languageId, 'mdx')
  assert.ifError(code.error)
  assert.equal(code.snapshot, snapshot)
  assert.deepEqual(code.mappings, [
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
  assert.deepEqual(code.embeddedCodes, [
    {
      embeddedCodes: [],
      id: 'jsx',
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
        '  /**',
        '   * @internal',
        '   *   **Do not use.** This is an MDX internal.',
        '   */',
        '  const _components = {',
        '    ...props.components,',
        '    /** The [props](https://mdxjs.com/docs/using-mdx/#props) that have been passed to the MDX component. */',
        '    props',
        '  }',
        '  return <>',
        '    <>',
        "    {''}",
        '    </>',
        '  </>',
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
        '/** @typedef {(0 extends 1 & Props ? {} : Props) & {components?: {}}} MDXContentProps */',
        ''
      )
    },
    {
      embeddedCodes: [],
      id: 'md',
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

test('support checkMdx', () => {
  const plugin = createMdxLanguagePlugin(undefined, true)

  const snapshot = snapshotFromLines('')

  const code = plugin.createVirtualCode('/test.mdx', 'mdx', snapshot)

  assert.ok(code instanceof VirtualMdxCode)
  assert.equal(code.id, 'mdx')
  assert.equal(code.languageId, 'mdx')
  assert.ifError(code.error)
  assert.equal(code.snapshot, snapshot)
  assert.deepEqual(code.mappings, [
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
  assert.deepEqual(code.embeddedCodes, [
    {
      embeddedCodes: [],
      id: 'jsx',
      languageId: 'javascriptreact',
      mappings: [],
      snapshot: snapshotFromLines(
        '// @ts-check',
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
        '  /**',
        '   * @internal',
        '   *   **Do not use.** This is an MDX internal.',
        '   */',
        '  const _components = {',
        '    ...props.components,',
        '    /** The [props](https://mdxjs.com/docs/using-mdx/#props) that have been passed to the MDX component. */',
        '    props',
        '  }',
        '  return <>',
        '  </>',
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
        '/** @typedef {(0 extends 1 & Props ? {} : Props) & {components?: {}}} MDXContentProps */',
        ''
      )
    },
    {
      embeddedCodes: [],
      id: 'md',
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

test('support custom jsxImportSource', () => {
  const plugin = createMdxLanguagePlugin(undefined, false, 'preact')

  const snapshot = snapshotFromLines('')

  const code = plugin.createVirtualCode('/test.mdx', 'mdx', snapshot)

  assert.ok(code instanceof VirtualMdxCode)
  assert.equal(code.id, 'mdx')
  assert.equal(code.languageId, 'mdx')
  assert.ifError(code.error)
  assert.equal(code.snapshot, snapshot)
  assert.deepEqual(code.mappings, [
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
  assert.deepEqual(code.embeddedCodes, [
    {
      embeddedCodes: [],
      id: 'jsx',
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
        '  /**',
        '   * @internal',
        '   *   **Do not use.** This is an MDX internal.',
        '   */',
        '  const _components = {',
        '    ...props.components,',
        '    /** The [props](https://mdxjs.com/docs/using-mdx/#props) that have been passed to the MDX component. */',
        '    props',
        '  }',
        '  return <>',
        '  </>',
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
        '/** @typedef {(0 extends 1 & Props ? {} : Props) & {components?: {}}} MDXContentProps */',
        ''
      )
    },
    {
      embeddedCodes: [],
      id: 'md',
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
