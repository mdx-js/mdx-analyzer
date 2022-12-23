import {initializeMonacoMDX} from '@mdx-js/monaco'
import {monaco} from 'playwright-monaco'

monaco.languages.register({
  id: 'mdx',
  extensions: ['.mdx']
})

initializeMonacoMDX(monaco)
