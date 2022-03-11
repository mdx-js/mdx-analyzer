import type * as ts from 'typescript/lib/tsserverlibrary';
import { Logger } from '../logger';
import { MdxSnapshotManager } from '../mdx-snapshots';
import { isMdxFilePath } from '../utils';
import { decorateGetDefinition } from './definition';
import { decorateDiagnostics } from './diagnostics';

export function decorateLanguageService(
    ls: ts.LanguageService,
    snapshotManager: MdxSnapshotManager,
    logger: Logger
): ts.LanguageService {
    patchLineColumnOffset(ls, snapshotManager);
    decorateDiagnostics(ls, logger);
    decorateGetDefinition(ls, snapshotManager, logger);
    return ls;
}

function patchLineColumnOffset(ls: ts.LanguageService, snapshotManager: MdxSnapshotManager) {
    if (!ls.toLineColumnOffset) {
        return;
    }

    // We need to patch this because (according to source, only) getDefinition uses this
    const toLineColumnOffset = ls.toLineColumnOffset;
    ls.toLineColumnOffset = (fileName, position) => {
        if (isMdxFilePath(fileName)) {
            const snapshot = snapshotManager.get(fileName);
            if (snapshot) {
                return snapshot.positionAt(position);
            }
        }
        return toLineColumnOffset(fileName, position);
    };
}
