import type {ReactNode} from 'react'

export interface PlanetProps {
  /**
   * The distance of the planet from its star.
   */
  distanceFromStar: number

  /**
   * The name of the planet.
   */
  name: string

  /**
   * The radius of the planet.
   */
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
