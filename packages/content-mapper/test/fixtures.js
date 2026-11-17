import {readdir, readFile} from 'node:fs/promises'
import {dirname, join} from 'node:path'
import {test} from 'node:test'

import {transformResultToMarkdown} from 'content-mapper-test-utils'
import {includeKeys} from 'filter-obj'
import {assertEqual, testFixturesDirectory} from 'snapshot-fixtures'
import typescript from 'typescript'

import {closeProject} from '../lib/requests/close-project.js'
import {openProject} from '../lib/requests/open-project.js'
import {transform} from '../lib/requests/transform.js'
import pkg from '../package.json' with {type: 'json'}

const directory = new URL('../fixtures/', import.meta.url)

let count = 0

testFixturesDirectory({
  directory,
  write: true,
  tests: {
    async 'readme.md'(file) {
      const original = String(file)
      const dir = dirname(file.path)
      const tsconfigFileName = join(dir, 'tsconfig.json')
      const configSourceFile = typescript.readJsonConfigFile(
        tsconfigFileName,
        typescript.sys.readFile
      )
      const {options, raw} = typescript.parseJsonSourceFileConfigFileContent(
        configSourceFile,
        typescript.sys,
        dir,
        undefined,
        tsconfigFileName
      )
      const mdxContentMapper = /** @type {any[]} */ (raw.contentMappers).find(
        (contentMapper) => contentMapper.package === pkg.name
      )
      count += 1
      const projectHandle = `${pkg.name}@${pkg.version}:${count}`
      await openProject({
        configFileName: tsconfigFileName,
        compilerOptions: includeKeys(
          options,
          pkg.typescript.contentMapper.compilerOptions
        ),
        options: mdxContentMapper.options,
        projectHandle
      })
      const result = transform({
        content: original,
        fileName: file.path,
        projectHandle
      })
      closeProject({projectHandle})

      return transformResultToMarkdown(original, result)
    }
  }
})

test('tsconfig.json', async () => {
  const names = await readdir(directory)
  const actual = await readFile(new URL('tsconfig.json', directory), 'utf8')
  const expected = [
    '{',
    '  "files": [],',
    '  "references": [',
    names
      .filter((name) => name !== 'tsconfig.json')
      .sort()
      .map((name) => `    { "path": "./${name}/tsconfig.json" }`)
      .join(',\n'),
    '  ]',
    '}',
    ''
  ].join('\n')

  assertEqual(actual, expected)
})
