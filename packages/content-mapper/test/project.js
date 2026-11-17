import assert from 'node:assert/strict'
import {describe, test} from 'node:test'

import {closeProject} from '../lib/requests/close-project.js'
import {openProject} from '../lib/requests/open-project.js'
import {nonNull} from '../lib/util/misc.js'
import {normalizeOptions, projects} from '../lib/util/projects.js'
import pkg from '../package.json' with {type: 'json'}

describe('requests', () => {
  test('open and close project', async () => {
    const projectHandle = `${pkg.name}@${pkg.version}:0`
    const openProjectResult = await openProject({
      compilerOptions: {},
      configFileName: '/example/tsconfig.json',
      projectHandle,
      options: {}
    })

    assert.deepEqual(openProjectResult, {optionDiagnostics: []})
    const {micromarkExtensions, ...project} = nonNull(
      projects.get(projectHandle)
    )
    assert.deepEqual(project, {
      checkCodeBlocks: false,
      checkMdx: false,
      configFileName: '/example/tsconfig.json',
      jsxImportSource: 'react',
      mdExtensions: [
        '.md',
        '.markdown',
        '.mdown',
        '.mkdn',
        '.mkd',
        '.mdwn',
        '.mkdown',
        '.ron'
      ],
      plugins: [],
      preset: undefined,
      providerImportSource: undefined
    })

    closeProject({projectHandle})
    assert.equal(projects.has(projectHandle), false)
  })
})

describe('normalizeOptions', () => {
  test('default options', async () => {
    const [{micromarkExtensions, ...project}, diagnostics] =
      await normalizeOptions({
        configFileName: '/test/tsconfig.json',
        compilerOptions: {}
      })

    assert.deepEqual(project, {
      checkCodeBlocks: false,
      checkMdx: false,
      configFileName: '/test/tsconfig.json',
      jsxImportSource: 'react',
      mdExtensions: [
        '.md',
        '.markdown',
        '.mdown',
        '.mkdn',
        '.mkd',
        '.mdwn',
        '.mkdown',
        '.ron'
      ],
      plugins: [],
      preset: undefined,
      providerImportSource: undefined
    })
    assert.deepEqual(diagnostics, [])
  })

  describe('checkCodeBlocks', () => {
    test('allowJs true', async () => {
      const [{micromarkExtensions, ...project}, diagnostics] =
        await normalizeOptions({
          configFileName: '/test/tsconfig.json',
          compilerOptions: {},
          options: {
            checkCodeBlocks: true
          }
        })

      assert.deepEqual(project, {
        checkCodeBlocks: true,
        checkMdx: false,
        configFileName: '/test/tsconfig.json',
        jsxImportSource: 'react',
        mdExtensions: [
          '.md',
          '.markdown',
          '.mdown',
          '.mkdn',
          '.mkd',
          '.mdwn',
          '.mkdown',
          '.ron'
        ],
        plugins: [],
        preset: undefined,
        providerImportSource: undefined
      })
      assert.deepEqual(diagnostics, [])
    })

    test('non boolean', async () => {
      const [{micromarkExtensions, ...project}, diagnostics] =
        await normalizeOptions({
          configFileName: '/test/tsconfig.json',
          compilerOptions: {},
          options: {
            checkCodeBlocks: 'this is not a boolean'
          }
        })

      assert.deepEqual(project, {
        checkCodeBlocks: false,
        checkMdx: false,
        configFileName: '/test/tsconfig.json',
        jsxImportSource: 'react',
        mdExtensions: [
          '.md',
          '.markdown',
          '.mdown',
          '.mkdn',
          '.mkd',
          '.mdwn',
          '.mkdown',
          '.ron'
        ],
        plugins: [],
        preset: undefined,
        providerImportSource: undefined
      })
      assert.deepEqual(diagnostics, [
        {
          code: 1001,
          messageText:
            "Content mapper option 'checkCodeBlocks' requires a value of type boolean.",
          path: ['checkCodeBlocks']
        }
      ])
    })
  })

  describe('checkMdx', () => {
    test('allowJs false', async () => {
      const [{micromarkExtensions, ...project}, diagnostics] =
        await normalizeOptions({
          configFileName: '/test/tsconfig.json',
          compilerOptions: {},
          options: {
            checkMdx: true
          }
        })

      assert.deepEqual(project, {
        checkCodeBlocks: false,
        checkMdx: true,
        configFileName: '/test/tsconfig.json',
        jsxImportSource: 'react',
        mdExtensions: [
          '.md',
          '.markdown',
          '.mdown',
          '.mkdn',
          '.mkd',
          '.mdwn',
          '.mkdown',
          '.ron'
        ],
        plugins: [],
        preset: undefined,
        providerImportSource: undefined
      })
      assert.deepEqual(diagnostics, [
        {
          code: 1002,
          messageText:
            "Content mapper option 'checkMdx' cannot be specified without specifying compiler option 'allowJs'.",
          path: ['checkMdx']
        }
      ])
    })

    test('allowJs true', async () => {
      const [{micromarkExtensions, ...project}, diagnostics] =
        await normalizeOptions({
          configFileName: '/test/tsconfig.json',
          compilerOptions: {
            allowJs: true
          },
          options: {
            checkMdx: true
          }
        })

      assert.deepEqual(project, {
        checkCodeBlocks: false,
        checkMdx: true,
        configFileName: '/test/tsconfig.json',
        jsxImportSource: 'react',
        mdExtensions: [
          '.md',
          '.markdown',
          '.mdown',
          '.mkdn',
          '.mkd',
          '.mdwn',
          '.mkdown',
          '.ron'
        ],
        plugins: [],
        preset: undefined,
        providerImportSource: undefined
      })
      assert.deepEqual(diagnostics, [])
    })

    test('non boolean', async () => {
      const [{micromarkExtensions, ...project}, diagnostics] =
        await normalizeOptions({
          configFileName: '/test/tsconfig.json',
          compilerOptions: {},
          options: {
            checkMdx: 'this is not a boolean'
          }
        })

      assert.deepEqual(project, {
        checkCodeBlocks: false,
        checkMdx: false,
        configFileName: '/test/tsconfig.json',
        jsxImportSource: 'react',
        mdExtensions: [
          '.md',
          '.markdown',
          '.mdown',
          '.mkdn',
          '.mkd',
          '.mdwn',
          '.mkdown',
          '.ron'
        ],
        plugins: [],
        preset: undefined,
        providerImportSource: undefined
      })
      assert.deepEqual(diagnostics, [
        {
          code: 1001,
          messageText:
            "Content mapper option 'checkMdx' requires a value of type boolean.",
          path: ['checkMdx']
        }
      ])
    })
  })

  describe('configFileName', () => {
    test('non-empty', async () => {
      const [{micromarkExtensions, ...project}, diagnostics] =
        await normalizeOptions({
          configFileName: '/path/to/tsconfig.json',
          compilerOptions: {}
        })

      assert.deepEqual(project, {
        checkCodeBlocks: false,
        checkMdx: false,
        configFileName: '/path/to/tsconfig.json',
        jsxImportSource: 'react',
        mdExtensions: [
          '.md',
          '.markdown',
          '.mdown',
          '.mkdn',
          '.mkd',
          '.mdwn',
          '.mkdown',
          '.ron'
        ],
        plugins: [],
        preset: undefined,
        providerImportSource: undefined
      })
      assert.deepEqual(diagnostics, [])
    })

    test('empty', async () => {
      const [{micromarkExtensions, ...project}, diagnostics] =
        await normalizeOptions({
          configFileName: '',
          compilerOptions: {}
        })

      assert.deepEqual(project, {
        checkCodeBlocks: false,
        checkMdx: false,
        configFileName: undefined,
        jsxImportSource: 'react',
        mdExtensions: [
          '.md',
          '.markdown',
          '.mdown',
          '.mkdn',
          '.mkd',
          '.mdwn',
          '.mkdown',
          '.ron'
        ],
        plugins: [],
        preset: undefined,
        providerImportSource: undefined
      })
      assert.deepEqual(diagnostics, [])
    })
  })

  describe('jsxImportSource', () => {
    test('string', async () => {
      const [{micromarkExtensions, ...project}, diagnostics] =
        await normalizeOptions({
          configFileName: '/test/tsconfig.json',
          compilerOptions: {
            jsxImportSource: 'preact'
          }
        })

      assert.deepEqual(project, {
        checkCodeBlocks: false,
        checkMdx: false,
        configFileName: '/test/tsconfig.json',
        jsxImportSource: 'preact',
        mdExtensions: [
          '.md',
          '.markdown',
          '.mdown',
          '.mkdn',
          '.mkd',
          '.mdwn',
          '.mkdown',
          '.ron'
        ],
        plugins: [],
        preset: undefined,
        providerImportSource: undefined
      })
      assert.deepEqual(diagnostics, [])
    })

    test('non-string', async () => {
      const [{micromarkExtensions, ...project}, diagnostics] =
        await normalizeOptions({
          configFileName: '/test/tsconfig.json',
          compilerOptions: {
            jsxImportSource: undefined
          }
        })

      assert.deepEqual(project, {
        checkCodeBlocks: false,
        checkMdx: false,
        configFileName: '/test/tsconfig.json',
        jsxImportSource: 'react',
        mdExtensions: [
          '.md',
          '.markdown',
          '.mdown',
          '.mkdn',
          '.mkd',
          '.mdwn',
          '.mkdown',
          '.ron'
        ],
        plugins: [],
        preset: undefined,
        providerImportSource: undefined
      })
      assert.deepEqual(diagnostics, [])
    })
  })

  describe('mdExtensions', () => {
    test('non-array', async () => {
      const [{micromarkExtensions, ...project}, diagnostics] =
        await normalizeOptions({
          configFileName: '/test/tsconfig.json',
          compilerOptions: {},
          options: {
            mdExtensions: '.md'
          }
        })

      assert.deepEqual(project, {
        checkCodeBlocks: false,
        checkMdx: false,
        configFileName: '/test/tsconfig.json',
        jsxImportSource: 'react',
        mdExtensions: [
          '.md',
          '.markdown',
          '.mdown',
          '.mkdn',
          '.mkd',
          '.mdwn',
          '.mkdown',
          '.ron'
        ],
        plugins: [],
        preset: undefined,
        providerImportSource: undefined
      })

      assert.deepEqual(diagnostics, [
        {
          code: 1001,
          messageText:
            "Content mapper option 'mdExtensions' requires a value of type Array.",
          path: ['mdExtensions']
        }
      ])
    })

    test('array', async () => {
      const [{micromarkExtensions, ...project}, diagnostics] =
        await normalizeOptions({
          configFileName: '/test/tsconfig.json',
          compilerOptions: {},
          options: {
            mdExtensions: ['.md', 'markdown', {ext: '.mkd'}]
          }
        })

      assert.deepEqual(project, {
        checkCodeBlocks: false,
        checkMdx: false,
        configFileName: '/test/tsconfig.json',
        jsxImportSource: 'react',
        mdExtensions: ['.md'],
        plugins: [],
        preset: undefined,
        providerImportSource: undefined
      })
      assert.deepEqual(diagnostics, [
        {
          code: 1003,
          messageText: "File extension 'markdown' must begin with a '.'.",
          path: ['mdExtensions', 1]
        },
        {
          code: 1001,
          messageText:
            "Content mapper option 'mdExtensions[2]' requires a value of type string.",
          path: ['mdExtensions', 2]
        }
      ])
    })
  })

  describe('providerImportSource', () => {
    test('string', async () => {
      const [{micromarkExtensions, ...project}, diagnostics] =
        await normalizeOptions({
          configFileName: '/test/tsconfig.json',
          compilerOptions: {},
          options: {
            providerImportSource: './mdx-components.tsx'
          }
        })

      assert.deepEqual(project, {
        checkCodeBlocks: false,
        checkMdx: false,
        configFileName: '/test/tsconfig.json',
        jsxImportSource: 'react',
        mdExtensions: [
          '.md',
          '.markdown',
          '.mdown',
          '.mkdn',
          '.mkd',
          '.mdwn',
          '.mkdown',
          '.ron'
        ],
        plugins: [],
        preset: undefined,
        providerImportSource: './mdx-components.tsx'
      })
      assert.deepEqual(diagnostics, [])
    })

    test('non-string', async () => {
      const [{micromarkExtensions, ...project}, diagnostics] =
        await normalizeOptions({
          configFileName: '/test/tsconfig.json',
          compilerOptions: {},
          options: {
            providerImportSource: true
          }
        })

      assert.deepEqual(project, {
        checkCodeBlocks: false,
        checkMdx: false,
        configFileName: '/test/tsconfig.json',
        jsxImportSource: 'react',
        mdExtensions: [
          '.md',
          '.markdown',
          '.mdown',
          '.mkdn',
          '.mkd',
          '.mdwn',
          '.mkdown',
          '.ron'
        ],
        plugins: [],
        preset: undefined,
        providerImportSource: undefined
      })
      assert.deepEqual(diagnostics, [
        {
          code: 1001,
          messageText:
            "Content mapper option 'providerImportSource' requires a value of type string.",
          path: ['providerImportSource']
        }
      ])
    })
  })
})
