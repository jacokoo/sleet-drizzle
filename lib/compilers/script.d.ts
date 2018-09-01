import { AbstractCompiler, Tag, NodeType, SleetNode, SleetStack, Compiler, Context } from 'sleet';
export declare class ScriptCompiler extends AbstractCompiler<Tag> {
    static type: NodeType;
    static create(node: SleetNode, stack: SleetStack): Compiler | undefined;
    compile(context: Context): void;
    check(): any;
    getReferences(items: any): string[];
    getArrayValue(arr: any, name: any): string[];
    getPropertyKey(prop: any): string;
    getContent(): string;
}
