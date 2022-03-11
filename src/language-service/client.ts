import * as vscode from 'vscode'
import { ServerOptions, LanguageClient, TransportKind, LanguageClientOptions } from 'vscode-languageclient/node'

export interface ClientOptions {
    serverModule: string
    serverPath: string
    port: number
    languageId: string
    languageName: string
}

export function createClient(options: ClientOptions) {
    const { port, serverPath, serverModule, languageId, languageName } = options
    const debugOptions = { execArgv: ['--nolazy', `--inspect=${port}`] };
    const serverOptions: ServerOptions = {
        run: { module: serverModule, transport: TransportKind.ipc },
        debug: {
            module: serverModule,
            transport: TransportKind.ipc,
            options: debugOptions
        }
    };

    const clientOptions: LanguageClientOptions = {
        documentSelector: [{ scheme: 'file', language: languageId }],
        synchronize: {
            configurationSection: ['typescript', 'javascript' ],
            fileEvents: vscode.workspace.createFileSystemWatcher('{**/*.js,**/*.ts}')
        },
        initializationOptions: {
            serverPath
        }
    };

    return {
        createLanguageServer
    }

    function createLanguageServer() {
		return new LanguageClient(languageId, languageName, serverOptions, clientOptions);
	}
}
