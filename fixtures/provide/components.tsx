import {type ReactNode} from 'react'

export type PlanetProps = {
  distanceFromStar: number

  name: string

  radius: number
}

/**
 * A planet in a solar system.
 */
export function Planet({
  distanceFromStar,
  name,
  radius
}: PlanetProps): ReactNode {
  return (
    <section>
      <dl>
        <dd>Name</dd>
        <dt>{name}</dt>
        <dd>Radius</dd>
        <dt>{radius}</dt>
        <dd>Distance from star</dd>
        <dt>{distanceFromStar}</dt>
      </dl>
    </section>
  )
}
