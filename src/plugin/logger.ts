import type * as ts from 'typescript/lib/tsserverlibrary';

export class Logger {
    constructor(
        private tsLogService: ts.server.Logger,
        suppressNonMdxLogs = false,
        private logDebug = false
    ) {
        if (suppressNonMdxLogs) {
            const log = this.tsLogService.info.bind(this.tsLogService);
            this.tsLogService.info = (s: string) => {
                if (s.startsWith('-Mdx Plugin-')) {
                    log(s);
                }
            };
        }
    }

    log(...args: any[]) {
        const str = args
            .map((arg) => {
                if (typeof arg === 'object') {
                    try {
                        return JSON.stringify(arg);
                    } catch (e) {
                        return '[object that cannot by stringified]';
                    }
                }
                return arg;
            })
            .join(' ');
        this.tsLogService.info('-Mdx Plugin- ' + str);
    }

    debug(...args: any[]) {
        if (!this.logDebug) {
            return;
        }
        this.log(...args);
    }
}
