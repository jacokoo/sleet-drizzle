import { AbstractCompiler, Tag, Context, NodeType, SleetNode, SleetStack, Compiler, AttributeGroup } from 'sleet';
export declare class NormalTagCompiler extends AbstractCompiler<Tag> {
    static type: NodeType;
    static create(node: SleetNode, stack: SleetStack): Compiler | undefined;
    compile(ctx: Context): string;
    nodeType(): string;
    mergeGroup(): AttributeGroup;
}
export declare class CommentCompiler extends AbstractCompiler<Tag> {
    static type: NodeType;
    static create(node: SleetNode, stack: SleetStack): Compiler | undefined;
    compile(): void;
}
export declare class RegionCompiler extends AbstractCompiler<Tag> {
    static type: NodeType;
    static create(node: SleetNode, stack: SleetStack): Compiler | undefined;
    compile(ctx: Context): string;
}
