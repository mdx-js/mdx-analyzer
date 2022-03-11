import type * as ts from "typescript/lib/tsserverlibrary";
import { AllowedTargetExtensions } from "./types";

export interface CreatePatchedCompilerOptionsOptions {
    ts: typeof ts
    options: ts.CompilerOptions
    targetExtension: AllowedTargetExtensions
}

export function createPatchedCompilerOptions (options: CreatePatchedCompilerOptionsOptions): ts.CompilerOptions {
    const { ts, targetExtension } = options

    return {
        ...options.options,
        allowNonTsExtensions: true,
        jsx: targetExtension === ts.Extension.Tsx ? ts.JsxEmit.Preserve : ts.JsxEmit.None,
    }
}
