import * as vscode from 'vscode'
import * as path from 'path'
import * as fs from 'fs'

const defaultTsdk = 'node_modules/typescript/lib';

export function getCurrentTsPaths(context: vscode.ExtensionContext) {
    if (isUseWorkspaceTsdk(context)) {
        const workspaceTsPaths = getWorkspaceTsPaths(true);
        if (workspaceTsPaths) {
            return { ...workspaceTsPaths, isWorkspacePath: true };
        }
    }
    return { ...getVscodeTsPaths(), isWorkspacePath: false };
}

function getWorkspaceTsPaths(useDefault = false) {
    let tsdk = getTsdk();
    if (!tsdk && useDefault) {
        tsdk = defaultTsdk;
    }
    if (tsdk) {
        const fsPaths = (vscode.workspace.workspaceFolders ?? []).map(folder => folder.uri.fsPath);
        const tsPath = getWorkspaceTypescriptPath(tsdk, fsPaths);
        if (tsPath) {
            return {
                serverPath: tsPath
            };
        }
    }
}

export function getVscodeTypescriptPath(appRoot: string) {
    return path.join(appRoot, 'extensions', 'node_modules', 'typescript', 'lib', 'typescript.js');
}

export function findTypescriptModulePathInLib(lib: string) {

    const tsserverlibrary = path.join(lib, 'tsserverlibrary.js');
    const typescript = path.join(lib, 'typescript.js');
    const tsserver = path.join(lib, 'tsserver.js');

    if (fs.existsSync(tsserverlibrary)) {
        return tsserverlibrary;
    }
    if (fs.existsSync(typescript)) {
        return typescript;
    }
    if (fs.existsSync(tsserver)) {
        return tsserver;
    }
}

export function getWorkspaceTypescriptPath(tsdk: string, workspaceFolderFsPaths: string[]) {
    if (path.isAbsolute(tsdk)) {
        const tsPath = findTypescriptModulePathInLib(tsdk);
        if (tsPath) {
            return tsPath;
        }
    }
    else {
        for (const folder of workspaceFolderFsPaths) {
            const tsPath = findTypescriptModulePathInLib(path.join(folder, tsdk));
            if (tsPath) {
                return tsPath;
            }
        }
    }
}

function getVscodeTsPaths() {
    return {
        serverPath: getVscodeTypescriptPath(vscode.env.appRoot),
    }
}

function getTsdk() {
    const tsConfigs = vscode.workspace.getConfiguration('typescript');
    const tsdk = tsConfigs.get<string>('tsdk');
    return tsdk;
}

function isUseWorkspaceTsdk(context: vscode.ExtensionContext) {
    return context.workspaceState.get('typescript.useWorkspaceTsdk', false);
}
