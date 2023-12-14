#!/usr/bin/bash
npm pack --pack-destination "$PWD" --workspace @mdx-js/language-service
npm pack --pack-destination "$PWD" --workspace @mdx-js/language-server
npx --workspace vscode-mdx vsce package --out "$PWD"

node scripts/tag-extension.mjs
npx changeset publish
npx ovsx publish --packagePath ./*.vsix
npx vsce publish --packagePath ./*.vsix
