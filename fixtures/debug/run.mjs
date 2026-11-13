#!/usr/bin/env node
import {register} from 'node:module'

// eslint-disable-next-line import-x/no-extraneous-dependencies
import {createElement} from 'react'
// eslint-disable-next-line import-x/no-extraneous-dependencies
import {renderToStaticMarkup} from 'react-dom/server'

register('@mdx-js/node-loader', import.meta.url)

const module = await import('./example.mdx')

// eslint-disable-next-line no-console
console.log(renderToStaticMarkup(createElement(module.default)))
