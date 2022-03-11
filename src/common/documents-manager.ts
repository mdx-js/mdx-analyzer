import * as fs from 'fs';
import * as sourceMap from 'source-map';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { Connection, TextDocumentChangeEvent, TextDocuments } from 'vscode-languageserver';
import { normalizePath } from './paths';

const languageId = 'typescript';
const startVersion = 1;

export interface GeneratedDocumentEntry {
    doc: TextDocument,
    map: Promise<sourceMap.SourceMapConsumer>
}

export interface GeneratedDocumentArguments {
    code: string,
    map: Promise<sourceMap.SourceMapConsumer>
}

export interface DocumentsManagerArgs {
    getGeneratedDocumentArgsFromDoc: (fileName: string, doc: TextDocument) => GeneratedDocumentArguments
    onDidChangeGeneratedCode?(fileName: string, code: string): void
    onDidCreateGeneratedCode?(fileName: string, code: string): void
}

export class DocumentsManager {
    private documents = new TextDocuments(TextDocument)
    private generatedDocuments = new Map<string, GeneratedDocumentEntry>();
    private externalDocuments = new Map<string, TextDocument>();

    constructor(private args: DocumentsManagerArgs) {

    }

    listen (connection: Connection) {
        this.documents.listen(connection)

        this.documents.onDidOpen(this.onDidOpen.bind(this))
        this.documents.onDidSave(this.onDidSave.bind(this))
        this.documents.onDidChangeContent(this.onDidChangeContent.bind(this))
        this.documents.onDidClose(this.onDidClose.bind(this))
    }

    private onDidOpen (e: TextDocumentChangeEvent<TextDocument>) {
        const fileName = normalizePath(e.document.uri)
        const getArgs = () => this.args.getGeneratedDocumentArgsFromDoc(fileName, e.document);
        this.addOrUpdateGeneratedDocumentAndSourceMap(fileName, getArgs, e.document.version);
    }

    private onDidSave (e: TextDocumentChangeEvent<TextDocument>) {
        const fileName = normalizePath(e.document.uri)
        const getArgs = () => this.args.getGeneratedDocumentArgsFromDoc(fileName, e.document);
        this.addOrUpdateGeneratedDocumentAndSourceMap(fileName, getArgs, e.document.version);
    }

    private onDidClose (e: TextDocumentChangeEvent<TextDocument>) {
        const fileName = normalizePath(e.document.uri)
        this.deleteGeneratedDocumentAndSourceMap(fileName)
    }

    private onDidChangeContent (e: TextDocumentChangeEvent<TextDocument>) {
        const fileName = normalizePath(e.document.uri)
        const getArgs = () => this.args.getGeneratedDocumentArgsFromDoc(fileName, e.document);
        this.addOrUpdateGeneratedDocumentAndSourceMap(fileName, getArgs, e.document.version);
    }

    getDocument(fileName: string) {
        return this.documents.get(fileName)
    }

    getExternalDocument (fileName: string) {
        return this.externalDocuments.get(fileName)
    }

    getGeneratedDocumentEntry (fileName: string) {
        return this.generatedDocuments.get(fileName)
    }

    getGeneratedDocument (fileName: string) {
        return this.generatedDocuments.get(fileName)?.doc
    }

    getGeneratedSourceMap (fileName: string) {
        return this.generatedDocuments.get(fileName)?.map
    }

    addOrUpdateGeneratedDocumentAndSourceMap (fileName: string, getArgs: () => GeneratedDocumentArguments, version: number) {
        const existed = this.generatedDocuments.get(fileName);
        if (existed) {
            if (existed.doc.version !== version) {
                const { code, map } = getArgs()
                const doc = TextDocument.create(fileName, languageId, version, code);
                const entry: GeneratedDocumentEntry = {
                    doc,
                    map
                }
                this.generatedDocuments.set(fileName, entry)
                this.args.onDidChangeGeneratedCode?.(fileName, code)
                return entry
            }
        } else {
            const { code, map } = getArgs()
            const doc = TextDocument.create(fileName, languageId, version, code);
            const entry: GeneratedDocumentEntry = {
                doc,
                map
            }
            this.generatedDocuments.set(fileName, entry)
            this.args.onDidCreateGeneratedCode?.(fileName, code)
            return entry
        }
    }

    deleteGeneratedDocumentAndSourceMap (fileName: string) {
        this.generatedDocuments.delete(fileName)
    }

    addExternalDocument(fileName: string, text: string) {
        const doc = TextDocument.create(fileName, languageId, startVersion, text)
        this.externalDocuments.set(fileName, doc)
        return doc
    }

    getOrLoadOriginalDocument(fileName: string) {
        const doc = this.documents.get(fileName)
        if (doc) {
            return doc
        }

        return this.getOrLoadExternalDocument(fileName);
    }

    getOrLoadExternalDocument(fileName: string) {
        const doc = this.externalDocuments.get(fileName)
        if (doc) {
            return doc
        }

        return this.loadExternalDocument(fileName)
    }

    private loadExternalDocument(fileName: string) {
        if (fs.existsSync(fileName)) {
            const text = fs.readFileSync(fileName).toString();
            if (text) {
                return this.addExternalDocument(fileName, text)
            }
        }
        return undefined
    }
}