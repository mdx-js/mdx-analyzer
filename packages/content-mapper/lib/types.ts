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

type FrontmatterTokenTypeMap<Prefix extends string> = {
  [
    Key in
      `${Prefix}Fence` | `${Prefix}FenceSequence` | `${Prefix}Value` | Prefix
  ]: [Key]
}

declare module 'micromark-util-types' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface TokenTypeMap extends FrontmatterTokenTypeMap<'toml' | 'yaml'> {}
}
