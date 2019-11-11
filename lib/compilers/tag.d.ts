import { AbstractCompiler, Tag, NodeType, SleetNode, SleetStack, Compiler, Context } from 'sleet';
export declare class TagCompiler extends AbstractCompiler<Tag> {
    static type: NodeType;
    static create(node: SleetNode, stack: SleetStack): Compiler | undefined;
    compile(ctx: Context): void;
}
