import { ExtensionContext } from 'vscode'
import { createClient } from './language-service/client'
import { getCurrentTsPaths } from './common/tsdk';

export async function activate(context: ExtensionContext) {
    const serverModule = require.resolve('./server.js');
    console.log('Loading server from ', serverModule);

    const serverPath = getCurrentTsPaths(context).serverPath

    const { createLanguageServer } = createClient({
        serverModule,
        serverPath,
        port: 6009,
        languageId: 'mdx',
        languageName: 'Mdx'
    })

    const ls = createLanguageServer();
	
	ls.onReady().then(() => {
        console.log('Start mdx ls');
	})

    context.subscriptions.push(ls.start());
}
