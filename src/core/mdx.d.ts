declare module "@mdx-js/mdx" {
    import * as unified from 'unified'
    export function createMdxAstCompiler(options: { remarkPlugins: never[] }): unified.Processor;
}
