import type * as ts from 'typescript/lib/tsserverlibrary'
import * as path from 'path'
import { normalizeFileName } from './paths';

export interface ReadTsConfigOptions {
    ts: typeof ts
    tsConfigFilePath: string
}

export function readTsConfig (options: ReadTsConfigOptions) {
    const { ts, tsConfigFilePath } = options

    const realTsConfigPath = ts.sys.realpath?.(tsConfigFilePath) ?? tsConfigFilePath;
    const config = ts.readJsonConfigFile(realTsConfigPath, ts.sys.readFile);
    return {
        config,
        realTsConfigPath
    }
}

export interface CreateParsedCommandLineOptions {
    ts: typeof ts,
    host: ts.ParseConfigHost
    config: ts.TsConfigSourceFile
    realTsConfigPath: string
}

export function createParsedCommandLineFromConfig (
    options: CreateParsedCommandLineOptions
) {
    const { ts, config, host, realTsConfigPath } = options;
    const basePath = path.dirname(realTsConfigPath);
    const tsConfigFileName = path.basename(realTsConfigPath);

    const parsedCommandLine = ts.parseJsonSourceFileConfigFileContent(config, host, basePath, undefined, tsConfigFileName);
    parsedCommandLine.fileNames = parsedCommandLine.fileNames.map(normalizeFileName);
    return parsedCommandLine
}
