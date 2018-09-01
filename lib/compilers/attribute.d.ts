import { AbstractCompiler, NodeType, SleetNode, SleetStack, Compiler, Attribute } from 'sleet';
export declare class AttributeCompilerFactory extends AbstractCompiler<Attribute> {
    static type: NodeType;
    static create(node: SleetNode, stack: SleetStack): Compiler | undefined;
    compile(): void;
}
