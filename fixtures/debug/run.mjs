#!/usr/bin/env node
import {register} from 'node:module'
import {renderToStaticMarkup} from 'react-dom/server'
import React from 'react'

register('@mdx-js/node-loader', import.meta.url)

const module = await import('./example.mdx')

console.log(renderToStaticMarkup(React.createElement(module.default)))
