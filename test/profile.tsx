interface ProfileProps {
  /**
   * How old fhe person is in years.
   */
  age: number

  /**
   * The display name of the user.
   *
   * This is more text.
   *
   * This is **even more** text.
   *
   * @deprecated asd
   */
  name: string
}

/**
 * Render a user profile.
 */
export function Profile({ age, name }: ProfileProps) {
  return (
    <dl>
      <dt>Name</dt>
      <dd>{name}</dd>
      <dt>Age</dt>
      <dd>{age}</dd>
    </dl>
  )
}
