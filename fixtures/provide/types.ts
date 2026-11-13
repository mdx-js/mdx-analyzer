import type {Planet} from './components.js'

declare global {
  interface MDXProvidedComponents {
    /**
     * The `<Planet />` React component
     */
    Planet: typeof Planet
  }
}
