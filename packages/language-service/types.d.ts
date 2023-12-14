declare module 'estree' {
  export interface BaseNode {
    start: number
    end: number
  }
}

declare module 'mdast' {
  export interface TOML extends Literal {
    type: 'toml'
  }

  export interface RootContentMap {
    toml: TOML
  }
}

export {}
