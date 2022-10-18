/**
 * Create a shallow copy of the original object, but bind all functions to the original object.
 *
 * @template T The type of the object.
 * @param {T} object The object to copy.
 * @returns {T} The shallow copy.
 */
export function bindAll(object) {
  /** @type {T} */
  const copy = Object.create(null)
  // eslint-disable-next-line sonar/for-in
  for (const key in object) {
    const value = object[key]
    if (typeof value === 'function') {
      copy[key] = value.bind(object)
    } else {
      copy[key] = value
    }
  }
  return copy
}
