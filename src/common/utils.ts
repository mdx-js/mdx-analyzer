export function isDef<T>(v: T | null | undefined): v is T {
  return v !== undefined && v !== null
}

export function assertDef<T>(v: T | null | undefined): asserts v is T {
  if (!isDef(v)) {
    throw new Error('')
  }
}

export function first<T>(v: T[] | null | undefined): T {
  if (!v?.length) {
    throw new Error('')
  }
  return v[0]
}
