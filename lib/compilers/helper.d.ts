import { HelperAttribute, AbstractCompiler, NodeType, SleetNode, SleetStack, Compiler, Context, Helper } from 'sleet';
export declare class HelperAttributeCompiler extends AbstractCompiler<HelperAttribute> {
    static type: NodeType;
    static create(node: SleetNode, stack: SleetStack): Compiler | undefined;
    ignoreName: boolean;
    constructor(node: HelperAttribute, stack: SleetStack, ignoreName: boolean);
    compile(ctx: Context): void;
}
export declare class HelperCompiler extends AbstractCompiler<Helper> {
    static type: NodeType;
    static create(node: SleetNode, stack: SleetStack): Compiler | undefined;
    compile(ctx: Context): void;
}
