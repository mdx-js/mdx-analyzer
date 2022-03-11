import type * as ts from "typescript/lib/tsserverlibrary";

export interface ExtensionOptions {
    fromExtension: string;
    targetExtension: AllowedTargetExtensions;
}

export type AllowedTargetExtensions = ts.Extension.Ts | ts.Extension.Tsx;
