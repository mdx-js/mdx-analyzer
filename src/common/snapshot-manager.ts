import type * as ts from "typescript/lib/tsserverlibrary";
import { isDef } from ".";

export interface CreateSnapshotManagerOptions extends UpdateSnatshotOptions {
    ts: typeof ts
}

export interface UpdateSnatshotOptions {
    createSnapshot: (fileName: string, text: string) => ts.IScriptSnapshot
    readFile(fileName: string): string | undefined
}

export interface SnapshotEntry {
    snapshot: ts.IScriptSnapshot | undefined
    version: number
}

export class SnapshotManager {
    private _map = new Map<string, SnapshotEntry>()

    constructor(private _options: CreateSnapshotManagerOptions) {

    }

    createOrGet(fileName: string) {
        const existed = this._map.get(fileName)
        if (isDef(existed) && isDef(existed.snapshot)) {
            return existed.snapshot
        }

        const text = this._options.readFile(fileName);
        if (isDef(text)) {
            const snapshot = this._options.createSnapshot(fileName, text);
            this._map.set(fileName, {
                snapshot,
                version: 1
            })
            return snapshot
        }
        return undefined
    }

    getSnapshot(fileName: string) {
        return this._map.get(fileName)?.snapshot;
    }

    getVersion(fileName: string) {
        return this._map.get(fileName)?.version;
    }

    update(fileName: string, cb: (snap: ts.IScriptSnapshot | undefined, options: UpdateSnatshotOptions) => ts.IScriptSnapshot) {
        const existed = this._map.get(fileName);
        if (isDef(existed)) {
            const newSnapshot = cb(existed.snapshot, this._options);
            if (newSnapshot !== existed.snapshot) {
                existed.snapshot = newSnapshot
                existed.version++
            }
        }
    }

    delete(fileName: string) {
        const existed = this._map.get(fileName);
        if (isDef(existed)) {
            existed.snapshot = undefined;
            existed.version++;
        }
    }

    keys() {
        return Array.from(this._map.keys());
    }
}
