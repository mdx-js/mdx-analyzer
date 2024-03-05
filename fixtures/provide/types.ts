import {type Planet} from './components.js'

declare global {
  interface MDXProvidedComponents {
    Planet: typeof Planet
  }
}
