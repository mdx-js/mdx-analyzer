# Changelog

## 1.2.1

### Patch Changes

- [#286](https://github.com/mdx-js/vscode-mdx/pull/286) [`eb774d0`](https://github.com/mdx-js/vscode-mdx/commit/eb774d08a2b4b59dbcc839b1df6d0b42831a35c5) Thanks [@remcohaszing](https://github.com/remcohaszing)! - Fix an issue causing false positive diagnostics in non-MDX files.

## 1.2.0

### Minor Changes

- [#272](https://github.com/mdx-js/vscode-mdx/pull/272) [`4aad7ef`](https://github.com/mdx-js/vscode-mdx/commit/4aad7ef6ff16ab8e4695dcff344ebd3b1739f6bf) Thanks [@remcohaszing](https://github.com/remcohaszing)! - Support remark syntax plugins.

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

- [#285](https://github.com/mdx-js/vscode-mdx/pull/285) [`31966db`](https://github.com/mdx-js/vscode-mdx/commit/31966db0eb65f7ac723357ffbb17d9e8d08ea5e3) Thanks [@remcohaszing](https://github.com/remcohaszing)! - Rename the `Markdown React` language to `MDX`.

### Patch Changes

- [#279](https://github.com/mdx-js/vscode-mdx/pull/279) [`2a8b266`](https://github.com/mdx-js/vscode-mdx/commit/2a8b266fe3b1a8a6b982a4a92ab26a147d5b3552) Thanks [@remcohaszing](https://github.com/remcohaszing)! - Fix a crash of neither `allowJs` not `checkJs` is true in `tsconfig.json`.

- [#281](https://github.com/mdx-js/vscode-mdx/pull/281) [`b0bc3a1`](https://github.com/mdx-js/vscode-mdx/commit/b0bc3a1feb1509730447c021e841a60be05d0d39) Thanks [@remcohaszing](https://github.com/remcohaszing)! - Fix a crash that occurs if:

  - no `tsconfig.json` exists.
  - `tsconfig.json` specifies `includes`, but doesn’t include the MDX file.
  - `tsconfig.json` specifies `excludes` and excludes the MDX file.
  - a new file is created.
  - a file is renamed.

- [#273](https://github.com/mdx-js/vscode-mdx/pull/273) [`ed9382e`](https://github.com/mdx-js/vscode-mdx/commit/ed9382e19ec6337f113d3e9350a94edfc113c57b) Thanks [@remcohaszing](https://github.com/remcohaszing)! - Previously the MDX language server handled TypeScript IntelliSense for
  JavaScript and TypeScript files as well.
  This led to duplicate IntelliSense results in the editor if people have also
  enabled TypeScript IntelliSense.

  These files are still synchronized with the MDX language server, because they
  are needed for context, but they no longer yield results when interacted with.

## 1.1.0

### Minor Changes

- [#226](https://github.com/mdx-js/vscode-mdx/pull/226) [`0fdf371`](https://github.com/mdx-js/vscode-mdx/commit/0fdf3716f45615aa3ebbacb5f2f4d49029bbbecf) Thanks [@remcohaszing](https://github.com/remcohaszing)! - Add experimental IntelliSense

  To enable IntelliSense, set `mdx.experimentalLanguageServer` to `true` in your
  VSCode settings.
  You can verify it’s enabled by interacting with the JavaScript parts on an MDX
  document, for example by hovering an import or variable

- [#222](https://github.com/mdx-js/vscode-mdx/pull/222) [`d2eb7a7`](https://github.com/mdx-js/vscode-mdx/commit/d2eb7a7cf23cb0f7b435d6f0b71c21f10ed93ad6) Thanks [@KeyboardSounds](https://github.com/KeyboardSounds)! - Support for highlighting JSX evaluated expressions

  In JSX, you can include JS expressions within tags, like:

  ```mdx
  <Component>{doSomething('a', 7)}</Component>
  ```

  This PR adds syntax highlighting for those expressions by adding a new pattern
  in the `tmLanguage.json`.

## 1.0.3

### Patch Changes

- [#219](https://github.com/mdx-js/vscode-mdx/pull/219) [`46d91dc`](https://github.com/mdx-js/vscode-mdx/commit/46d91dc43e8c862be089cc4aad34ed2dc4336534) Thanks [@grahampcharles](https://github.com/grahampcharles)! - fix: remove superfluous `embeddedLanguages` setting

## 1.0.2

### Patch Changes

- [#214](https://github.com/mdx-js/vscode-mdx/pull/214) [`4275105`](https://github.com/mdx-js/vscode-mdx/commit/4275105e18d61b231ffcc18b23c7b6e827a35283) Thanks [@remcohaszing](https://github.com/remcohaszing)! - chore: update extension metadata content and README

## 1.0.1

### Patch Changes

- [#212](https://github.com/mdx-js/vscode-mdx/pull/212) [`f73d790`](https://github.com/mdx-js/vscode-mdx/commit/f73d790b52cd70b0c984dd956aece5ef848aaf96) Thanks [@JounQin](https://github.com/JounQin)! - docs: change to use transferred publisher

## 1.0.0

### Major Changes

- [#207](https://github.com/mdx-js/vscode-mdx/pull/207) [`1181523`](https://github.com/mdx-js/vscode-mdx/commit/1181523ff3178be6de05f8a6684d7f4c452e4cf8) Thanks [@JounQin](https://github.com/JounQin)! - build!: republish under `unifiedjs` org

### Patch Changes

- [#207](https://github.com/mdx-js/vscode-mdx/pull/207) [`1181523`](https://github.com/mdx-js/vscode-mdx/commit/1181523ff3178be6de05f8a6684d7f4c452e4cf8) Thanks [@JounQin](https://github.com/JounQin)! - ci: add publish workflow for releasing on CI automatically

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [0.3.2](https://github.com/mdx-js/vscode-mdx/compare/v0.3.1...v0.3.2) (2022-07-06)

### Bug Fixes

- correct badge links, add donate and funding fields ([ed75936](https://github.com/mdx-js/vscode-mdx/commit/ed759369b94121f54e74d91090a6e42f06b9898e))

### [0.3.1](https://github.com/mdx-js/vscode-mdx/compare/v0.3.0...v0.3.1) (2022-07-06)

## [0.3.0](https://github.com/mdx-js/vscode-mdx/compare/v0.2.3...v0.3.0) (2022-07-06)

### ⚠ BREAKING CHANGES

- use mdx v2 comment syntax

### Features

- use mdx v2 comment syntax ([b4a5968](https://github.com/mdx-js/vscode-mdx/commit/b4a5968213d83ccca3dd96d0fd2ce3aaba8ab505))

### [0.2.3](https://github.com/mdx-js/vscode-mdx/compare/v0.2.2...v0.2.3) (2021-03-17)

### [0.2.2](https://github.com/mdx-js/vscode-mdx/compare/v0.2.1...v0.2.2) (2020-08-05)

### Bug Fixes

- remove property activationEvents ([744b330](https://github.com/mdx-js/vscode-mdx/commit/744b330660feb9441e2febfcafff091c8d71ae1e))

### [0.2.1](https://github.com/mdx-js/vscode-mdx/compare/v0.2.0...v0.2.1) (2020-08-05)

### Bug Fixes

- it seems git+https can not be recognized ([f723438](https://github.com/mdx-js/vscode-mdx/commit/f723438cb2f1132d1872157ebe1186214a755b97))

## [0.2.0](https://github.com/mdx-js/vscode-mdx/compare/v0.1.4...v0.2.0) (2020-08-05)

### Features

- remove unused lsp codes - close [#140](https://github.com/mdx-js/vscode-mdx/issues/140) ([c1383e1](https://github.com/mdx-js/vscode-mdx/commit/c1383e192a80752e10463f4cc792ba9b305bf842))

### Bug Fixes

- marketplace "repository" link is broken ([#139](https://github.com/mdx-js/vscode-mdx/issues/139)) ([804e0f7](https://github.com/mdx-js/vscode-mdx/commit/804e0f77438eede4685e01f861056c0a082532e4))

### [0.1.4](https://github.com/rx-ts/vscode-mdx/compare/v0.1.3...v0.1.4) (2020-04-09)

### Bug Fixes

- remove deprecated eslint config options - close [#126](https://github.com/rx-ts/vscode-mdx/issues/126) ([06b2818](https://github.com/rx-ts/vscode-mdx/commit/06b281854214353bec3159120b752ae0e37aecba))

### 0.1.3 (2019-11-18)

### Features

- first blood, init from vscode examples ([6c9420f](https://github.com/rx-ts/vscode-mdx/commit/6c9420f88f97745c07f34b736b51f27594e3c289))
- improve basic grammar support ([f998d2a](https://github.com/rx-ts/vscode-mdx/commit/f998d2ad7d5d1d70aeb4ac440656cab0e55bb3ae))
