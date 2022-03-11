export function isDef<T>(v: T | undefined | null): v is T {
    return v !== undefined && v !== null
}

export function assertDef<T>(v: T | undefined | null): asserts v is T {
    if (!isDef(v)) {
        throw new Error("")
    }
}

export function first<T>(v: T[] | undefined | null): T {
    if (!v?.length) {
        throw new Error("")
    }
    return v[0]
}
