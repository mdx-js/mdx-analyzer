#!/usr/bin/bash
npm pack --pack-destination "$PWD" --workspace @mdx-js/language-service
npm pack --pack-destination "$PWD" --workspace @mdx-js/language-server
npm pack --pack-destination "$PWD" --workspace @mdx-js/language-monaco
npx --workspace vscode-mdx vsce package --out "$PWD"

npx changeset publish
npx ovsx publish --packagePath ./*.vsix
npx vsce publish --packagePath ./*.vsix
