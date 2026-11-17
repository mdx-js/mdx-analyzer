import {Parser} from 'acorn'
import jsx from 'acorn-jsx'

export const acorn = Parser.extend(jsx())
