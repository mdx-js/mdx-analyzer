/**
 * @internal
 */
declare module 'estree' {
  interface BaseNode {
    start: number
    end: number
  }
}

/**
 * @internal
 */
declare module 'mdast' {
  interface TOML extends Literal {
    type: 'toml'
  }

  interface RootContentMap {
    toml: TOML
  }
}
