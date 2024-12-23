# @mdx-js/language-service

## 0.6.0

### Minor Changes

- [#473](https://github.com/mdx-js/mdx-analyzer/pull/473) [`2854c38`](https://github.com/mdx-js/mdx-analyzer/commit/2854c38ceaf9202a9a3aa5ae33e50ca2a8c41f1e) Thanks [@remcohaszing](https://github.com/remcohaszing)! - Convert the custom MDX syntax toggle request types into LSP commands.

### Patch Changes

- [#478](https://github.com/mdx-js/mdx-analyzer/pull/478) [`3b135e8`](https://github.com/mdx-js/mdx-analyzer/commit/3b135e82607f0d5d19f9cf27e6bb465543c7c841) Thanks [@remcohaszing](https://github.com/remcohaszing)! - Use an asterisk to toggle emphasis

- [#477](https://github.com/mdx-js/mdx-analyzer/pull/477) [`ed87d22`](https://github.com/mdx-js/mdx-analyzer/commit/ed87d226bdc18afb60332bc55f0fd687efd98d42) Thanks [@remcohaszing](https://github.com/remcohaszing)! - Use two tildes to toggle delete syntax

## 0.5.8

### Patch Changes

- [#460](https://github.com/mdx-js/mdx-analyzer/pull/460) [`163f4bc`](https://github.com/mdx-js/mdx-analyzer/commit/163f4bc8368122fb97ff1d7c7a52f9edecd265a8) Thanks [@johnsoncodehk](https://github.com/johnsoncodehk)! - Update to Volar 2.4

## 0.5.7

### Patch Changes

- [#450](https://github.com/mdx-js/mdx-analyzer/pull/450) [`9767738`](https://github.com/mdx-js/mdx-analyzer/commit/976773851618fcc2018671d56d7902216873ceb6) Thanks [@remcohaszing](https://github.com/remcohaszing)! - Solve a regression caused by TypeScript 5.5

- [#446](https://github.com/mdx-js/mdx-analyzer/pull/446) [`044776e`](https://github.com/mdx-js/mdx-analyzer/commit/044776e8e156cb5fd42e4f016215b9eefec894bd) Thanks [@johnsoncodehk](https://github.com/johnsoncodehk)! - Update to Volar 2.3.

## 0.5.6

### Patch Changes

- [#448](https://github.com/mdx-js/mdx-analyzer/pull/448) [`52e38fa`](https://github.com/mdx-js/mdx-analyzer/commit/52e38fad3d1062eabb4ec19580e805cb889f79bb) Thanks [@remcohaszing](https://github.com/remcohaszing)! - Fix virtual code if a child of a JSX node starts with a `>` character.

## 0.5.5

### Patch Changes

- [#425](https://github.com/mdx-js/mdx-analyzer/pull/425) [`dcb89a9`](https://github.com/mdx-js/mdx-analyzer/commit/dcb89a9202449b28ae1cfb079b3f82ec9ba41afc) Thanks [@remcohaszing](https://github.com/remcohaszing)! - Fix the file lookup in syntax toggles

- [#431](https://github.com/mdx-js/mdx-analyzer/pull/431) [`186af69`](https://github.com/mdx-js/mdx-analyzer/commit/186af697b6244f2d3fac0707570c4753d925dd42) Thanks [@johnsoncodehk](https://github.com/johnsoncodehk)! - Update to Volar 2.2.

## 0.5.4

### Patch Changes

- [#410](https://github.com/mdx-js/mdx-analyzer/pull/410) [`712f007`](https://github.com/mdx-js/mdx-analyzer/commit/712f007f459c2c8d3a25c8cab83176d97ecc8e89) Thanks [@remcohaszing](https://github.com/remcohaszing)! - Mark MDX internals with `@internal`, not `@deprecated`.

- [#410](https://github.com/mdx-js/mdx-analyzer/pull/410) [`712f007`](https://github.com/mdx-js/mdx-analyzer/commit/712f007f459c2c8d3a25c8cab83176d97ecc8e89) Thanks [@remcohaszing](https://github.com/remcohaszing)! - Always mark the internal variable `_components` as used.

## 0.5.3

### Patch Changes

- [#402](https://github.com/mdx-js/mdx-analyzer/pull/402) [`cd59565`](https://github.com/mdx-js/mdx-analyzer/commit/cd59565dcc284adcebe738407e62022150bbca81) Thanks [@remcohaszing](https://github.com/remcohaszing)! - Support custom components provided via a provider

- [#404](https://github.com/mdx-js/mdx-analyzer/pull/404) [`1eef65c`](https://github.com/mdx-js/mdx-analyzer/commit/1eef65c8a63b42aacf524189067b6c29aaae9e86) Thanks [@remcohaszing](https://github.com/remcohaszing)! - Update the documentation.

## 0.5.2

### Patch Changes

- [#396](https://github.com/mdx-js/mdx-analyzer/pull/396) [`3b6c5a8`](https://github.com/mdx-js/mdx-analyzer/commit/3b6c5a8964f2dddb9b4d6b7ec8d304b506cc5cee) Thanks [@remcohaszing](https://github.com/remcohaszing)! - Support the `components` prop for MDX JSX tags and JSX expressions.

- [`c1277b2`](https://github.com/mdx-js/mdx-analyzer/commit/c1277b22d8760ffa9ff999d2444c929c5cab81e9) Thanks [@remcohaszing](https://github.com/remcohaszing)! - Support formatting of MDX ESM

## 0.5.1

### Patch Changes

- [#388](https://github.com/mdx-js/mdx-analyzer/pull/388) [`3069af7`](https://github.com/mdx-js/mdx-analyzer/commit/3069af7ade2feea2a65ad9ddcf241ceec55ec314) Thanks [@remcohaszing](https://github.com/remcohaszing)! - Update to Volar 2 stable.

- [#391](https://github.com/mdx-js/mdx-analyzer/pull/391) [`2b29d7a`](https://github.com/mdx-js/mdx-analyzer/commit/2b29d7a30c624e2115bd7f0c6c64846f9f1ab741) Thanks [@remcohaszing](https://github.com/remcohaszing)! - Avoid duplication when organizing imports.

## 0.5.0

### Minor Changes

- [#384](https://github.com/mdx-js/mdx-analyzer/pull/384) [`b9a910e`](https://github.com/mdx-js/mdx-analyzer/commit/b9a910e4d9e87535e2973f2d7b5704d0489bc2e0) Thanks [@remcohaszing](https://github.com/remcohaszing)! - Support the commands `mdx/toggleDelete`, `mdx/toggleEmphasis`, `mdx/toggleInlineCode`, and `mdx/toggleStrong`.

### Patch Changes

- [#383](https://github.com/mdx-js/mdx-analyzer/pull/383) [`135f633`](https://github.com/mdx-js/mdx-analyzer/commit/135f6339d345a191e4bfbdb25450813cbf446152) Thanks [@remcohaszing](https://github.com/remcohaszing)! - Expose function `resolveRemarkPlugins`

- [#387](https://github.com/mdx-js/mdx-analyzer/pull/387) [`4070c63`](https://github.com/mdx-js/mdx-analyzer/commit/4070c6374cb55caa64fdda697ee56b9328c6038d) Thanks [@remcohaszing](https://github.com/remcohaszing)! - Support `tsconfig.json` option `mdx.checkMdx`

- [`46bfd50`](https://github.com/mdx-js/mdx-analyzer/commit/46bfd50323f7d63037a99aea454c0cb67f1a4176) Thanks [@remcohaszing](https://github.com/remcohaszing)! - Update to Volar 2.0.0-alpha.14.

- [#381](https://github.com/mdx-js/mdx-analyzer/pull/381) [`ceb9a0b`](https://github.com/mdx-js/mdx-analyzer/commit/ceb9a0b587e9b0cd236a5e465c2aa1b24650a803) Thanks [@remcohaszing](https://github.com/remcohaszing)! - Implement Volar’s document drop edits

## 0.4.0

### Minor Changes

- [#376](https://github.com/mdx-js/mdx-analyzer/pull/376) [`81a69692bc96c7588d3531a9b6ea81a833f5738b`](https://github.com/mdx-js/mdx-analyzer/commit/81a69692bc96c7588d3531a9b6ea81a833f5738b) Thanks [@remcohaszing](https://github.com/remcohaszing)! - Rename `getMdxLanguageModule` to `createMdxLanguagePlugin`

- [#368](https://github.com/mdx-js/mdx-analyzer/pull/368) [`98d71d6e6cc439efa289097b134f843c1ad73299`](https://github.com/mdx-js/mdx-analyzer/commit/98d71d6e6cc439efa289097b134f843c1ad73299) Thanks [@remcohaszing](https://github.com/remcohaszing)! - Remove the dependency on an injected TypeScript module instance.

### Patch Changes

- [#374](https://github.com/mdx-js/mdx-analyzer/pull/374) [`b6b641dd05621d4819d3ac2d917cda0ecb385813`](https://github.com/mdx-js/mdx-analyzer/commit/b6b641dd05621d4819d3ac2d917cda0ecb385813) Thanks [@remcohaszing](https://github.com/remcohaszing)! - Report syntax errors.

- [#377](https://github.com/mdx-js/mdx-analyzer/pull/377) [`000db8cd1a15e7ed2723bd75a2871a92da1955aa`](https://github.com/mdx-js/mdx-analyzer/commit/000db8cd1a15e7ed2723bd75a2871a92da1955aa) Thanks [@remcohaszing](https://github.com/remcohaszing)! - Support await expressions.

- [#375](https://github.com/mdx-js/mdx-analyzer/pull/375) [`d808f9cb1a53405fc8fc474ecfc87eba55418aa0`](https://github.com/mdx-js/mdx-analyzer/commit/d808f9cb1a53405fc8fc474ecfc87eba55418aa0) Thanks [@remcohaszing](https://github.com/remcohaszing)! - Fix the return type of `MDXContent` in case of a syntax error

## 0.3.0

### Minor Changes

- [#365](https://github.com/mdx-js/mdx-analyzer/pull/365) [`de0c819acaeb79fc0b29515f6c73690e300510d3`](https://github.com/mdx-js/mdx-analyzer/commit/de0c819acaeb79fc0b29515f6c73690e300510d3) Thanks [@remcohaszing](https://github.com/remcohaszing)! - Support MDXLayout

### Patch Changes

- [#366](https://github.com/mdx-js/mdx-analyzer/pull/366) [`ee4439ac31d183e473754c5fdcba07bb3861d373`](https://github.com/mdx-js/mdx-analyzer/commit/ee4439ac31d183e473754c5fdcba07bb3861d373) Thanks [@remcohaszing](https://github.com/remcohaszing)! - Prettify props types in hover

- [#364](https://github.com/mdx-js/mdx-analyzer/pull/364) [`423bf184d88789b7f2a519f7a48d981f38756b0f`](https://github.com/mdx-js/mdx-analyzer/commit/423bf184d88789b7f2a519f7a48d981f38756b0f) Thanks [@remcohaszing](https://github.com/remcohaszing)! - Disable formatting

## 0.2.0

### Minor Changes

- [#340](https://github.com/mdx-js/mdx-analyzer/pull/340) [`045458d`](https://github.com/mdx-js/mdx-analyzer/commit/045458d1e43909207837bf6e3c6782367c2b70a8) Thanks [@remcohaszing](https://github.com/remcohaszing)! - Add function `getLanguageModule`.
  This function returns a [Volar](https://volarjs.dev) language module,

- [#344](https://github.com/mdx-js/mdx-analyzer/pull/344) [`d48c926`](https://github.com/mdx-js/mdx-analyzer/commit/d48c926b2a5c21cc764a865f18ea6cb7ff18daad) Thanks [@remcohaszing](https://github.com/remcohaszing)! - Update to MDX 3

- [#340](https://github.com/mdx-js/mdx-analyzer/pull/340) [`045458d`](https://github.com/mdx-js/mdx-analyzer/commit/045458d1e43909207837bf6e3c6782367c2b70a8) Thanks [@remcohaszing](https://github.com/remcohaszing)! - Remove `createMdxLanguageService`.

## 0.1.0

### Minor Changes

- [#316](https://github.com/mdx-js/mdx-analyzer/pull/316) [`5a04247`](https://github.com/mdx-js/mdx-analyzer/commit/5a0424707eef03a24aa15dffade882d118d55421) Thanks [@remcohaszing](https://github.com/remcohaszing)! - Initial release.
