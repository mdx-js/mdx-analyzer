import {type Planet} from './components.js'

declare global {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  type MDXProvidedComponents = {
    Planet: typeof Planet
  }
}
