# VS Code Extension

## Contributing

- Clone the repository
- Run `npm install`
- Run `npm start`
- Run `cd packages/vscode-mdx`
- Run `npm install`
- Open the VS Code Run and Debug pane and click Run Extension up at the top
  - Edit MDX files in the `demo` directory that opens
  - Place and hit breakpoints at desired code sites - the debugger will break
    (This extends to files in `language-server` as well.)
- Use the Output channel named Markdown Language Server in the main VS Code
  window (not the Extension Host window) to monitor LSP communication
