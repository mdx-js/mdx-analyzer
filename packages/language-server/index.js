#!/usr/bin/env node
import process from 'node:process'
import {
  createConnection,
  startTypeScriptServer
} from '@volar/language-server/node.js'
import {plugin} from './lib/language-server-plugin.js'

process.title = 'mdx-language-server'

startTypeScriptServer(createConnection(), plugin)
