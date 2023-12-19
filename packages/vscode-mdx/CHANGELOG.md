# Changelog

## 1.6.1

### Patch Changes

- [#374](https://github.com/mdx-js/mdx-analyzer/pull/374) [`b6b641dd05621d4819d3ac2d917cda0ecb385813`](https://github.com/mdx-js/mdx-analyzer/commit/b6b641dd05621d4819d3ac2d917cda0ecb385813) Thanks [@remcohaszing](https://github.com/remcohaszing)! - Report syntax errors.

- [#377](https://github.com/mdx-js/mdx-analyzer/pull/377) [`000db8cd1a15e7ed2723bd75a2871a92da1955aa`](https://github.com/mdx-js/mdx-analyzer/commit/000db8cd1a15e7ed2723bd75a2871a92da1955aa) Thanks [@remcohaszing](https://github.com/remcohaszing)! - Support await expressions.

## 1.6.0

### Minor Changes

- [#358](https://github.com/mdx-js/mdx-analyzer/pull/358) [`90c0e2d750ac91897179cb77e4c0e6b4555904e4`](https://github.com/mdx-js/mdx-analyzer/commit/90c0e2d750ac91897179cb77e4c0e6b4555904e4) Thanks [@remcohaszing](https://github.com/remcohaszing)! - Add a TypeScript version status item.
  Clicking it opens a menu to select the TypeScript version to use.

### Patch Changes

- [#357](https://github.com/mdx-js/mdx-analyzer/pull/357) [`7110d611e3cf704f050cccae68773622655e2c41`](https://github.com/mdx-js/mdx-analyzer/commit/7110d611e3cf704f050cccae68773622655e2c41) Thanks [@remcohaszing](https://github.com/remcohaszing)! - Fix dropping local images in an MDX file.

- [#364](https://github.com/mdx-js/mdx-analyzer/pull/364) [`423bf184d88789b7f2a519f7a48d981f38756b0f`](https://github.com/mdx-js/mdx-analyzer/commit/423bf184d88789b7f2a519f7a48d981f38756b0f) Thanks [@remcohaszing](https://github.com/remcohaszing)! - Disable formatting

## 1.5.0

### Minor Changes

- [`8a8dc1b`](https://github.com/mdx-js/mdx-analyzer/commit/8a8dc1bc745ae30b48b07e025ee10326bebe78ba) Thanks [@remcohaszing](https://github.com/remcohaszing)! - Enable the language server by default.
  The setting `mdx.experimentalLanguageServer` was renamed to `mdx.server.enable`.

- [#344](https://github.com/mdx-js/mdx-analyzer/pull/344) [`d48c926`](https://github.com/mdx-js/mdx-analyzer/commit/d48c926b2a5c21cc764a865f18ea6cb7ff18daad) Thanks [@remcohaszing](https://github.com/remcohaszing)! - Update to MDX 3

- [#340](https://github.com/mdx-js/mdx-analyzer/pull/340) [`045458d`](https://github.com/mdx-js/mdx-analyzer/commit/045458d1e43909207837bf6e3c6782367c2b70a8) Thanks [@remcohaszing](https://github.com/remcohaszing)! - The language server and Visual Studio Code extension are now based on [Volar](https://volarjs.dev).

- [#345](https://github.com/mdx-js/mdx-analyzer/pull/345) [`e02ea4f`](https://github.com/mdx-js/mdx-analyzer/commit/e02ea4fd5b4a98f6e12d85293b77016cdde5e6a8) Thanks [@remcohaszing](https://github.com/remcohaszing)! - Support drag and dropping text and images into the editor.

- [#348](https://github.com/mdx-js/mdx-analyzer/pull/348) [`6a5ef78`](https://github.com/mdx-js/mdx-analyzer/commit/6a5ef78787afb572df21dd4bc3fbf17933dc855b) Thanks [@remcohaszing](https://github.com/remcohaszing)! - Syntax highlight MDX code blocks in markdown files.

### Patch Changes

- [#338](https://github.com/mdx-js/mdx-analyzer/pull/338) [`c2c67b8`](https://github.com/mdx-js/mdx-analyzer/commit/c2c67b8d558c317909c264dbe0056e9218a18174) Thanks [@remcohaszing](https://github.com/remcohaszing)! - Define the configuration options `mdx.trace.server.verbosity` and `mdx.trace.server.format`.

## 1.4.0

### Minor Changes

- [#330](https://github.com/mdx-js/mdx-analyzer/pull/330) [`88d4db4`](https://github.com/mdx-js/mdx-analyzer/commit/88d4db46f7dcb66e0c0897c0c69c35b33fe6db3b) Thanks [@remcohaszing](https://github.com/remcohaszing)! - Add MDX file icons

### Patch Changes

- [#328](https://github.com/mdx-js/mdx-analyzer/pull/328) [`2630215`](https://github.com/mdx-js/mdx-analyzer/commit/26302153d58fc059ddb7644da255f87d171f948c) Thanks [@remcohaszing](https://github.com/remcohaszing)! - Update MDX grammar

## 1.3.0

### Minor Changes

- [#310](https://github.com/mdx-js/mdx-analyzer/pull/310) [`1585698`](https://github.com/mdx-js/mdx-analyzer/commit/1585698c0a896c7a91c4fb35871bcd2dbc04b213) Thanks [@remcohaszing](https://github.com/remcohaszing)! - Filter TypeScript based completions when writing markdown content.

- [#317](https://github.com/mdx-js/mdx-analyzer/pull/317) [`f1bd49b`](https://github.com/mdx-js/mdx-analyzer/commit/f1bd49b56e934811ff3ecf657b491557b53f820a) Thanks [@wooorm](https://github.com/wooorm)! - Add improved syntax highlighting grammar

  This now pulls in a grammar for from:
  <https://github.com/wooorm/markdown-tm-language>.

  It fixes a bunch of previous errors and adds real support for MDX.
  It also supports YAML frontmatter, TOML frontmatter, GFM (autolink
  literals, footnotes, strikethrough, tables, tasklists), GitHub (gemoji,
  mentions, references).
  There’s support for about 20 common embedded grammars in fenced code
  blocks.
  Embedded code (in fenced code blocks, or in ESM/expressions) is now
  marked as being the correct language, which makes comments and such
  work.

- [#315](https://github.com/mdx-js/mdx-analyzer/pull/315) [`e66b3a9`](https://github.com/mdx-js/mdx-analyzer/commit/e66b3a9ae7360e708f8c963d24d6e4572113d06d) Thanks [@remcohaszing](https://github.com/remcohaszing)! - Update to TypeScript 5.

### Patch Changes

- [#314](https://github.com/mdx-js/mdx-analyzer/pull/314) [`252b247`](https://github.com/mdx-js/mdx-analyzer/commit/252b247e4813b6fea331424ccb85ef1df6ea6450) Thanks [@remcohaszing](https://github.com/remcohaszing)! - Add backtick to `surroundingPairs`.

## 1.2.5

### Patch Changes

- [#308](https://github.com/mdx-js/mdx-analyzer/pull/308) [`991a617`](https://github.com/mdx-js/mdx-analyzer/commit/991a6177827837b66460d9f7e2a76626a7461870) Thanks [@remcohaszing](https://github.com/remcohaszing)! - Add support for `mdxJsxTextElement`.

## 1.2.4

### Patch Changes

- [#306](https://github.com/mdx-js/mdx-analyzer/pull/306) [`59798ff`](https://github.com/mdx-js/mdx-analyzer/commit/59798ffae6832805f534d0f7f02091e8bdbe72cf) Thanks [@remcohaszing](https://github.com/remcohaszing)! - Trim positions that can’t be mapped to the original MDX source code from diagnostics.

## 1.2.3

### Patch Changes

- [#300](https://github.com/mdx-js/mdx-analyzer/pull/300) [`e691483`](https://github.com/mdx-js/mdx-analyzer/commit/e691483cd14bf368606b8e8d47504ed3b1f16b8b) Thanks [@remcohaszing](https://github.com/remcohaszing)! - Trim positions that can’t be mapped to the original MDX source code.

- [#302](https://github.com/mdx-js/mdx-analyzer/pull/302) [`c406d37`](https://github.com/mdx-js/mdx-analyzer/commit/c406d37faf11fb8f1ea7a9b72043ec376267cc74) Thanks [@TomasHubelbauer](https://github.com/TomasHubelbauer)! - Remove backtick auto-completion to prevent doubling up backticks in inline code spans and code blocks

## 1.2.2

### Patch Changes

- [#290](https://github.com/mdx-js/mdx-analyzer/pull/290) [`1cfcf96`](https://github.com/mdx-js/mdx-analyzer/commit/1cfcf9662f0c95f8d86dbd076ffd077fedce8cce) Thanks [@remcohaszing](https://github.com/remcohaszing)! - Fix error when requesting folding ranges.

- [#294](https://github.com/mdx-js/mdx-analyzer/pull/294) [`1f885bc`](https://github.com/mdx-js/mdx-analyzer/commit/1f885bcd3bcedcd2a38784fb5518cfc31cdd30a0) Thanks [@remcohaszing](https://github.com/remcohaszing)! - Resolve definitions referencing unopened files.

## 1.2.1

### Patch Changes

- [#286](https://github.com/mdx-js/mdx-analyzer/pull/286) [`eb774d0`](https://github.com/mdx-js/mdx-analyzer/commit/eb774d08a2b4b59dbcc839b1df6d0b42831a35c5) Thanks [@remcohaszing](https://github.com/remcohaszing)! - Fix an issue causing false positive diagnostics in non-MDX files.

## 1.2.0

### Minor Changes

- [#272](https://github.com/mdx-js/mdx-analyzer/pull/272) [`4aad7ef`](https://github.com/mdx-js/mdx-analyzer/commit/4aad7ef6ff16ab8e4695dcff344ebd3b1739f6bf) Thanks [@remcohaszing](https://github.com/remcohaszing)! - Support remark syntax plugins.

  This extension supports remark syntax plugins.
  Plugins can be defined in an array of strings or string / options tuples.
  These plugins can be defined in `tsconfig.json` and will be resolved relative to
  that file.

  For example, to support
  [frontmatter](https://github.com/remarkjs/remark-frontmatter) with YAML and TOML
  and [GFM](https://github.com/remarkjs/remark-gfm):

  ```jsonc
  {
    "compilerOptions": {
      // …
    },
    "mdx": {
      "plugins": [["remark-frontmatter", ["toml", "yaml"]], "remark-gfm"]
    }
  }
  ```

- [#285](https://github.com/mdx-js/mdx-analyzer/pull/285) [`31966db`](https://github.com/mdx-js/mdx-analyzer/commit/31966db0eb65f7ac723357ffbb17d9e8d08ea5e3) Thanks [@remcohaszing](https://github.com/remcohaszing)! - Rename the `Markdown React` language to `MDX`.

### Patch Changes

- [#279](https://github.com/mdx-js/mdx-analyzer/pull/279) [`2a8b266`](https://github.com/mdx-js/mdx-analyzer/commit/2a8b266fe3b1a8a6b982a4a92ab26a147d5b3552) Thanks [@remcohaszing](https://github.com/remcohaszing)! - Fix a crash of neither `allowJs` not `checkJs` is true in `tsconfig.json`.

- [#281](https://github.com/mdx-js/mdx-analyzer/pull/281) [`b0bc3a1`](https://github.com/mdx-js/mdx-analyzer/commit/b0bc3a1feb1509730447c021e841a60be05d0d39) Thanks [@remcohaszing](https://github.com/remcohaszing)! - Fix a crash that occurs if:

  - no `tsconfig.json` exists.
  - `tsconfig.json` specifies `includes`, but doesn’t include the MDX file.
  - `tsconfig.json` specifies `excludes` and excludes the MDX file.
  - a new file is created.
  - a file is renamed.

- [#273](https://github.com/mdx-js/mdx-analyzer/pull/273) [`ed9382e`](https://github.com/mdx-js/mdx-analyzer/commit/ed9382e19ec6337f113d3e9350a94edfc113c57b) Thanks [@remcohaszing](https://github.com/remcohaszing)! - Previously the MDX language server handled TypeScript IntelliSense for
  JavaScript and TypeScript files as well.
  This led to duplicate IntelliSense results in the editor if people have also
  enabled TypeScript IntelliSense.

  These files are still synchronized with the MDX language server, because they
  are needed for context, but they no longer yield results when interacted with.

## 1.1.0

### Minor Changes

- [#226](https://github.com/mdx-js/mdx-analyzer/pull/226) [`0fdf371`](https://github.com/mdx-js/mdx-analyzer/commit/0fdf3716f45615aa3ebbacb5f2f4d49029bbbecf) Thanks [@remcohaszing](https://github.com/remcohaszing)! - Add experimental IntelliSense

  To enable IntelliSense, set `mdx.experimentalLanguageServer` to `true` in your
  VSCode settings.
  You can verify it’s enabled by interacting with the JavaScript parts on an MDX
  document, for example by hovering an import or variable

- [#222](https://github.com/mdx-js/mdx-analyzer/pull/222) [`d2eb7a7`](https://github.com/mdx-js/mdx-analyzer/commit/d2eb7a7cf23cb0f7b435d6f0b71c21f10ed93ad6) Thanks [@KeyboardSounds](https://github.com/KeyboardSounds)! - Support for highlighting JSX evaluated expressions

  In JSX, you can include JS expressions within tags, like:

  ```mdx
  <Component>{doSomething("a", 7)}</Component>
  ```

  This PR adds syntax highlighting for those expressions by adding a new pattern
  in the `tmLanguage.json`.

## 1.0.3

### Patch Changes

- [#219](https://github.com/mdx-js/mdx-analyzer/pull/219) [`46d91dc`](https://github.com/mdx-js/mdx-analyzer/commit/46d91dc43e8c862be089cc4aad34ed2dc4336534) Thanks [@grahampcharles](https://github.com/grahampcharles)! - fix: remove superfluous `embeddedLanguages` setting

## 1.0.2

### Patch Changes

- [#214](https://github.com/mdx-js/mdx-analyzer/pull/214) [`4275105`](https://github.com/mdx-js/mdx-analyzer/commit/4275105e18d61b231ffcc18b23c7b6e827a35283) Thanks [@remcohaszing](https://github.com/remcohaszing)! - chore: update extension metadata content and README

## 1.0.1

### Patch Changes

- [#212](https://github.com/mdx-js/mdx-analyzer/pull/212) [`f73d790`](https://github.com/mdx-js/mdx-analyzer/commit/f73d790b52cd70b0c984dd956aece5ef848aaf96) Thanks [@JounQin](https://github.com/JounQin)! - docs: change to use transferred publisher

## 1.0.0

### Major Changes

- [#207](https://github.com/mdx-js/mdx-analyzer/pull/207) [`1181523`](https://github.com/mdx-js/mdx-analyzer/commit/1181523ff3178be6de05f8a6684d7f4c452e4cf8) Thanks [@JounQin](https://github.com/JounQin)! - build!: republish under `unifiedjs` org

### Patch Changes

- [#207](https://github.com/mdx-js/mdx-analyzer/pull/207) [`1181523`](https://github.com/mdx-js/mdx-analyzer/commit/1181523ff3178be6de05f8a6684d7f4c452e4cf8) Thanks [@JounQin](https://github.com/JounQin)! - ci: add publish workflow for releasing on CI automatically

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [0.3.2](https://github.com/mdx-js/mdx-analyzer/compare/v0.3.1...v0.3.2) (2022-07-06)

### Bug Fixes

- correct badge links, add donate and funding fields ([ed75936](https://github.com/mdx-js/mdx-analyzer/commit/ed759369b94121f54e74d91090a6e42f06b9898e))

### [0.3.1](https://github.com/mdx-js/mdx-analyzer/compare/v0.3.0...v0.3.1) (2022-07-06)

## [0.3.0](https://github.com/mdx-js/mdx-analyzer/compare/v0.2.3...v0.3.0) (2022-07-06)

### ⚠ BREAKING CHANGES

- use mdx v2 comment syntax

### Features

- use mdx v2 comment syntax ([b4a5968](https://github.com/mdx-js/mdx-analyzer/commit/b4a5968213d83ccca3dd96d0fd2ce3aaba8ab505))

### [0.2.3](https://github.com/mdx-js/mdx-analyzer/compare/v0.2.2...v0.2.3) (2021-03-17)

### [0.2.2](https://github.com/mdx-js/mdx-analyzer/compare/v0.2.1...v0.2.2) (2020-08-05)

### Bug Fixes

- remove property activationEvents ([744b330](https://github.com/mdx-js/mdx-analyzer/commit/744b330660feb9441e2febfcafff091c8d71ae1e))

### [0.2.1](https://github.com/mdx-js/mdx-analyzer/compare/v0.2.0...v0.2.1) (2020-08-05)

### Bug Fixes

- it seems git+https can not be recognized ([f723438](https://github.com/mdx-js/mdx-analyzer/commit/f723438cb2f1132d1872157ebe1186214a755b97))

## [0.2.0](https://github.com/mdx-js/mdx-analyzer/compare/v0.1.4...v0.2.0) (2020-08-05)

### Features

- remove unused lsp codes - close [#140](https://github.com/mdx-js/mdx-analyzer/issues/140) ([c1383e1](https://github.com/mdx-js/mdx-analyzer/commit/c1383e192a80752e10463f4cc792ba9b305bf842))

### Bug Fixes

- marketplace "repository" link is broken ([#139](https://github.com/mdx-js/mdx-analyzer/issues/139)) ([804e0f7](https://github.com/mdx-js/mdx-analyzer/commit/804e0f77438eede4685e01f861056c0a082532e4))

### [0.1.4](https://github.com/mdx-js/mdx-analyzer/compare/v0.1.3...v0.1.4) (2020-04-09)

### Bug Fixes

- remove deprecated eslint config options - close [#126](https://github.com/mdx-js/mdx-analyzer/issues/126) ([06b2818](https://github.com/mdx-js/mdx-analyzer/commit/06b281854214353bec3159120b752ae0e37aecba))

### 0.1.3 (2019-11-18)

### Features

- first blood, init from vscode examples ([6c9420f](https://github.com/mdx-js/mdx-analyzer/commit/6c9420f88f97745c07f34b736b51f27594e3c289))
- improve basic grammar support ([f998d2a](https://github.com/mdx-js/mdx-analyzer/commit/f998d2ad7d5d1d70aeb4ac440656cab0e55bb3ae))
