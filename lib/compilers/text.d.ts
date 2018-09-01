import { AbstractCompiler, Tag, NodeType, SleetNode, SleetStack, Compiler, Context, StaticText, DynamicText } from 'sleet';
export declare class TextCompiler extends AbstractCompiler<Tag> {
    static type: NodeType;
    static create(node: SleetNode, stack: SleetStack): Compiler | undefined;
    compile(ctx: Context): string | undefined;
}
export declare class StaticTextCompiler extends AbstractCompiler<StaticText> {
    static type: NodeType;
    static create(node: SleetNode, stack: SleetStack): Compiler | undefined;
    compile(context: Context): void;
}
export declare class DynamicTextCompiler extends AbstractCompiler<DynamicText> {
    static type: NodeType;
    static create(node: SleetNode, stack: SleetStack): Compiler | undefined;
    compile(context: Context): void;
}
