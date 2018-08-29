import { HelperAttribute, AbstractCompiler, NodeType, SleetNode, SleetStack, Compiler, Context } from 'sleet'
import { put } from './tag-factory'

export class HelperAttributeCompiler extends AbstractCompiler<HelperAttribute> {
    static type: NodeType.CompareOperator
    static create (node: SleetNode, stack: SleetStack): Compiler | undefined {
        return new HelperAttributeCompiler(node as HelperAttribute, stack)
    }

    compile (ctx: Context) {
        put(this.stack, 'SV')
        ctx.push(`SV('${this.node.value}')`)
    }
}
