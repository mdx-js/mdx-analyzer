import {createLoader} from '@mdx-js/node-loader'
import {SourceMapGenerator} from 'source-map'

export const {load} = createLoader({SourceMapGenerator})
