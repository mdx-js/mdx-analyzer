---
'vscode-mdx': minor
---

Add improved syntax highlighting grammar

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

Closes GH-183.
Closes GH-191.
Closes GH-209.
Closes GH-221.
