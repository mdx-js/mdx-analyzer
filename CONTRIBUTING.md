# Contribute

This article explains how to contribute to MDX.
Please read through the following guidelines.

> 👉 **Note**: before participating in our community, please read our
> [code of conduct][coc].
> By interacting with this repository, organization, or community you agree to
> abide by its terms.

## Contributions

There’s several ways to contribute, not just by writing code.
If you have questions, see [§ Support][support].
If you can provide financial support, see [§ Sponsor][sponsor].

### Improve docs

As a user you’re perfect for helping us improve our docs.
Typo corrections, error fixes, better explanations, new examples, etcetera.

### Improve issues

Some issues lack information, aren’t reproducible, or are just incorrect.
You can help by trying to make them easier to resolve.
Existing issues might benefit from your unique experience or opinions.

### Write code

Code contributions are very welcome.
It’s probably a good idea to first post a question or open an issue to report a
bug or suggest a new feature before creating a pull request.

## Submitting an issue

* The issue tracker is for issues.
  Use discussions for support
* Search the issue tracker (including closed issues) before opening a new issue
* Ensure you’re using the latest version of our packages
* Use a clear and descriptive title
* Include as much information as possible: steps to reproduce the issue, error
  message, version, operating system, etcetera
* The more time you put into an issue, the better we will be able to help you
* The best issue report is a [failing test][unit-test] proving it

## Submitting a pull request

* See [¶ Project][project] below for info on how the project is structured,
  how to test, and how to build the site
* Non-trivial changes are often best discussed in an issue first, to prevent you
  from doing unnecessary work
* For ambitious tasks, you should try to get your work in front of the community
  for feedback as soon as possible
* New features should be accompanied by tests and documentation
* For significant changes, add a [changeset][] using the `npx changeset` command
* Don’t include unrelated changes
* Test before submitting code by running `npm test`
* Write a convincing description of why we should land your pull request:
  it’s your job to convince us

## Project

### Structure

MDX is a monorepo.
All packages are in `packages/`.
The `fixtures/` directory contains some workspaces that are used for testing
and debugging.

### Debug

You may use any editor you want.
But since this project contains a [Visual Studio Code][vscode] extension, it’s
most convenient to use Visual Studio Code.
This project contains a debugging configuration for Visual Studio Code.
From within the editor, press <kbd>F5</kbd> to build and debug the extension.
This will open the [fixtures](./fixtures/fixtures.code-workspace) workspace with
a new profile.
Use the [Volar Labs][] extension to inspect virtual code.

### Tests

To run the tests, first do `npm install`, then do `npm test`.
This ensures everything is okay, from code style to unit tests to types.

### Release

Releases are managed by [changesets][changeset].
If changesets are available, a bot will create a pull request.
Merge this pull request to make a release.
This will update the changelogs, publish the packages to npm, publish the Visual
Studio Code extension to the [marketplace][], and create GitHub releases.

## Resources

* [Good first issues in the MDX repository](https://github.com/mdx-js/mdx-analyzer/labels/good%20first%20issue%20👋)
* [How to contribute to open source](https://opensource.guide/how-to-contribute/)
* [Making your first contribution](https://medium.com/@vadimdemedes/making-your-first-contribution-de6576ddb190)
* [Using pull requests](https://help.github.com/articles/about-pull-requests/)
* [GitHub help](https://help.github.com)

[changeset]: .changeset/README.md

[coc]: https://github.com/mdx-js/.github/blob/main/code-of-conduct.md

[marketplace]: https://marketplace.visualstudio.com/items?itemName=unifiedjs.vscode-mdx

[project]: #project

[sponsor]: https://mdxjs.com/community/sponsor/

[support]: https://mdxjs.com/community/support/

[unit-test]: https://twitter.com/sindresorhus/status/579306280495357953

[volar labs]: https://marketplace.visualstudio.com/items?itemName=johnsoncodehk.volarjs-labs

[vscode]: https://code.visualstudio.com
