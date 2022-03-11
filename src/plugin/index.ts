import { decorateLanguageService } from './language-service';
import { Logger } from './logger';
import { patchModuleLoader } from './module-loader';
import { MdxSnapshotManager } from './mdx-snapshots';
import type * as ts from 'typescript/lib/tsserverlibrary';

export default function init(modules: { typescript: typeof ts }) {
    function create(info: ts.server.PluginCreateInfo) {
        const logger = new Logger(info.project.projectService.logger);
        logger.log('Starting Mdx plugin');

        const snapshotManager = new MdxSnapshotManager(
            modules.typescript,
            info.project.projectService,
            logger
        );

        patchModuleLoader(
            logger,
            snapshotManager,
            modules.typescript,
            info.languageServiceHost,
            info.project
        );
        return decorateLanguageService(info.languageService, snapshotManager, logger);
    }

    return { create };
}

