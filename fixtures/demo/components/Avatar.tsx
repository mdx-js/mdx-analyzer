export type AvatarProps = {
  /**
   * The avatar of the user to display.
   */
  avatar: string

  /**
   * The name of the user.
   */
  name: string
}

/**
 * Render a user avatar.
 */
export function Avatar({avatar, name}: AvatarProps) {
  return (
    <figure className="avatar">
      <img alt={name} src={avatar} />
    </figure>
  )
}
