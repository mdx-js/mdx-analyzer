import {configure} from '@mdx-js/monaco/mdx.worker.js'
import remarkFrontmatter from 'remark-frontmatter'
import remarkGfm from 'remark-gfm'

configure({
  plugins: [remarkFrontmatter, remarkGfm]
})
