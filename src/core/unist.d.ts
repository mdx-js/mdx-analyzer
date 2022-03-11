import { Node } from 'unist'

declare module "unist" {
    interface Node<TData extends object = Data> {
        value: string;
    }
}
