#!/usr/bin/env node
import process from 'node:process'
import {
  createConnection,
  startSimpleServer
} from '@volar/language-server/node.js'
import {plugin} from './lib/language-server-plugin.js'

process.title = 'mdx-language-server'

startSimpleServer(createConnection(), plugin)
