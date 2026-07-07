export interface Frontmatter {
  /**
   * The title of the document.
   */
  title: string

  /**
   * The publication date, as an ISO string.
   */
  date: string

  /**
   * Whether the document is a draft.
   */
  draft?: boolean
}
