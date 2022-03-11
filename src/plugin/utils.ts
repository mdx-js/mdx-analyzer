export function decorate <T, K extends keyof T>(obj: T, key: K, handler: (oldValue: T[K]) => T[K]) {
    const oldValue = obj[key]
    obj[key] = handler(oldValue);
}

export function isMdxFilePath(filePath: string) {
    return filePath.endsWith('.mdx');
}

export function isVirtualMdxFilePath(filePath: string) {
    return filePath.endsWith('.mdx.tsx');
}

export function toRealMdxFilePath(filePath: string) {
    return filePath.slice(0, -'.tsx'.length);
}

export function ensureRealMdxFilePath(filePath: string) {
    return isVirtualMdxFilePath(filePath) ? toRealMdxFilePath(filePath) : filePath;
}

export function isNotNullOrUndefined<T>(val: T | undefined | null): val is T {
    return val !== undefined && val !== null;
}

/**
 * Checks if this a section that should be completely ignored
 * because it's purely generated.
 */
export function isInGeneratedCode(text: string, start: number, end: number) {
    const lineStart = text.lastIndexOf('\n', start);
    const lineEnd = text.indexOf('\n', end);
    const lastStart = text.substring(lineStart, start).lastIndexOf('/*Ωignore_startΩ*/');
    const lastEnd = text.substring(lineStart, start).lastIndexOf('/*Ωignore_endΩ*/');
    return lastStart > lastEnd && text.substring(end, lineEnd).includes('/*Ωignore_endΩ*/');
}

/**
 * Checks that this isn't a text span that should be completely ignored
 * because it's purely generated.
 */
export function isNoTextSpanInGeneratedCode(text: string, span: ts.TextSpan) {
    return !isInGeneratedCode(text, span.start, span.start + span.length);
}

/**
 * Replace all occurrences of a string within an object with another string,
 */
export function replaceDeep<T extends Record<string, any>>(
    obj: T,
    searchStr: string | RegExp,
    replacementStr: string
): T {
    return _replaceDeep(obj);

    function _replaceDeep(_obj: any): any {
        if (typeof _obj === 'string') {
            return _obj.replace(searchStr, replacementStr);
        }
        if (Array.isArray(_obj)) {
            return _obj.map((entry) => _replaceDeep(entry));
        }
        if (typeof _obj === 'object') {
            return Object.keys(_obj).reduce((_o, key) => {
                _o[key] = _replaceDeep(_obj[key]);
                return _o;
            }, {} as any);
        }
        return _obj;
    }
}
