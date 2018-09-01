import { AbstractCompiler, Tag, NodeType, SleetNode, SleetStack, Compiler, Context } from 'sleet';
declare abstract class RootCompiler extends AbstractCompiler<Tag> {
    static type: NodeType;
    name: string;
    constructor(node: Tag, stack: SleetStack);
    compile(ctx: Context): void;
    params(): string;
    attributes(): string[];
}
export declare class ModuleCompiler extends RootCompiler {
    static create(node: SleetNode, stack: SleetStack): Compiler | undefined;
    name: string;
    params(): string;
}
export declare class ViewCompiler extends RootCompiler {
    static create(node: SleetNode, stack: SleetStack): Compiler | undefined;
    name: string;
    compile(ctx: Context): void;
}
export {};
