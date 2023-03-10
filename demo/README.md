# Demo of `@mdx-js/monaco`

## What is this?

This is a project to demo the `@mdx-js/monaco` package using [webpack][].
When started, this starts a webserver that serves Monaco editor and a file tree.
The contents of the `fixtures/demo` directory are loaded into [Monaco editor][].

## When should I use this?

You can use this demo to troubleshoot issues related to `@mdx-js/monaco`, or to
see how it can be integrated in your own project.

## Use

Clone and install this repository.

```sh
git clone https://github.com/mdx-js/mdx-analyzer.git
cd mdx-analyzer
npm install
```

Now start it.

```sh
npm start
```

This will serve the demo on <http://localhost:8080>.

## Compatibility

This demo is compatible with evergreen browsers.

## Security

The demo only uses local content.
No external resources are loaded.
It’s safe to run and open.

## License

[MIT][] © [Remco Haszing][author]

[author]: https://github.com/remcohaszing

[mit]: LICENSE

[monaco editor]: https://github.com/microsoft/monaco-editor

[webpack]: https://webpack.js.org
