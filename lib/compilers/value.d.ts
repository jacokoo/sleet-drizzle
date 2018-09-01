import { Compiler, AbstractCompiler, StringValue, Context, NodeType, SleetNode, SleetStack, NumberValue, BooleanValue, NullValue, IdentifierValue, CompareOperatorValue, TransformValue, Transformer } from 'sleet';
export declare class QuotedStringCompiler extends AbstractCompiler<StringValue> {
    static type: NodeType;
    static create(node: SleetNode, stack: SleetStack): Compiler | undefined;
    compile(ctx: Context): void;
}
export declare class NumberValueCompiler extends AbstractCompiler<NumberValue> {
    static type: NodeType;
    static create(node: SleetNode, stack: SleetStack): Compiler | undefined;
    compile(ctx: Context): void;
}
export declare class BooleanValueCompiler extends AbstractCompiler<BooleanValue> {
    static type: NodeType;
    static create(node: SleetNode, stack: SleetStack): Compiler | undefined;
    compile(ctx: Context): void;
}
export declare class NullValueCompiler extends AbstractCompiler<NullValue> {
    static type: NodeType;
    static create(node: SleetNode, stack: SleetStack): Compiler | undefined;
    compile(ctx: Context): void;
}
export declare class IdentifierValueCompiler extends AbstractCompiler<IdentifierValue> {
    static type: NodeType;
    static create(node: SleetNode, stack: SleetStack): Compiler | undefined;
    compile(ctx: Context): void;
}
export declare class CompareOperatorValueCompiler extends AbstractCompiler<CompareOperatorValue> {
    static type: NodeType;
    static create(node: SleetNode, stack: SleetStack): Compiler | undefined;
    compile(ctx: Context): void;
}
export declare class TransformValueCompiler extends AbstractCompiler<TransformValue> {
    static type: NodeType;
    static create(node: SleetNode, stack: SleetStack): Compiler | undefined;
    compile(ctx: Context): void;
}
export declare class TransformerCompiler extends AbstractCompiler<Transformer> {
    static type: NodeType;
    static create(node: SleetNode, stack: SleetStack): Compiler | undefined;
    compile(ctx: Context): void;
}
