/**
 * @internal
 */
declare module 'estree' {
  interface BaseNode {
    /**
     * The start offset.
     */
    start: number

    /**
     * The end offset.
     */
    end: number
  }
}

/**
 * @internal
 */
declare module 'mdast' {
  interface TOML extends Literal {
    /**
     * A TOML frontmatter node.
     */
    type: 'toml'
  }

  interface RootContentMap {
    /**
     * A TOML frontmatter node.
     */
    toml: TOML
  }
}
