import type {ReactNode} from 'react'

export interface AvatarProps {
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
export function Avatar({avatar, name}: AvatarProps): ReactNode {
  return (
    <figure className="avatar">
      <img alt={name} src={avatar} />
    </figure>
  )
}
