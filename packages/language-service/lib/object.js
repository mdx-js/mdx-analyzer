/**
 * Create a shallow copy of the original object, but bind all functions to the original object.
 *
 * @template {object} T
 *   The type of the object.
 * @param {T} object
 *   The object to copy.
 * @returns {T}
 *   The shallow copy.
 */
export function bindAll(object) {
  /** @type {T} */
  const copy = Object.create(null)
  let proto = object

  while (proto) {
    for (const key of Object.getOwnPropertyNames(proto)) {
      const k = /** @type {keyof T} */ (key)
      if (k === 'constructor') {
        continue
      }

      if (k in copy) {
        continue
      }

      const value = object[k]
      copy[k] = typeof value === 'function' ? value.bind(object) : value
    }

    proto = Object.getPrototypeOf(proto)
  }

  return copy
}
