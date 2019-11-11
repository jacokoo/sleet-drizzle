import { HelperAttribute, AbstractCompiler, NodeType, SleetNode, SleetStack, Compiler, Context, Helper } from 'sleet'
import { put } from './util'

export class HelperAttributeCompiler extends AbstractCompiler<HelperAttribute> {
    static type = NodeType.HelperAttribute
    static create (node: SleetNode, stack: SleetStack): Compiler | undefined {
        const ignore = stack.last()!.node.type !== NodeType.Attribute
        return new HelperAttributeCompiler(node as HelperAttribute, stack, ignore)
    }

    ignoreName: boolean
    constructor (node: HelperAttribute, stack: SleetStack, ignoreName: boolean) {
        super(node, stack)
        this.ignoreName = ignoreName
    }

    compile (ctx: Context) {
        if (this.ignoreName) {
            ctx.compileUp(this.node.value, this.stack)
            return
        }

        put(this.stack, 'AT')
        ctx.push(`AT('${this.node.name || ''}', `)
        ctx.compileUp(this.node.value, this.stack)
        ctx.push(')')
    }
}

export class HelperCompiler extends AbstractCompiler<Helper> {
    static type = NodeType.Helper
    static create (node: SleetNode, stack: SleetStack): Compiler | undefined {
        return new HelperCompiler(node as Helper, stack)
    }

    compile (ctx: Context) {
        if (this.node.name) {
            put(this.stack, 'HH')
            ctx.push(`HH('${this.node.name}'`)
            this.node.attributes.forEach(it => {
                ctx.push(', ')
                ctx.compileUp(it, this.stack)
            })
            ctx.push(')')
            return
        }

        // TODO these value maybe should be joined
        this.node.attributes.forEach((it, idx) => {
            if (idx) ctx.push(', ')
            put(this.stack, 'H')
            ctx.push('H(')
            ctx.compileUp(it, this.stack)
            ctx.push(')')
        })
    }
}
