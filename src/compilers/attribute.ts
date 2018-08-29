import { AbstractCompiler, NodeType, SleetNode, SleetStack, Compiler, Context, Attribute, Helper } from 'sleet'
import { put, id } from './tag-factory'

export const AttributeCompilerFactory = {
    type: NodeType.Attribute,

    create (node: SleetNode, stack: SleetStack): Compiler | undefined {
        return new AttributeCompiler(node as Attribute, stack)
    }
}

export class AttributeCompiler extends AbstractCompiler<Attribute> {

    compile (ctx: Context) {
        const dynamic = this.node.values.some(it =>
            it.type === NodeType.IdentifierValue || it.type === NodeType.Helper)

        const name = dynamic ? 'DA' : 'SA'
        put(this.stack, name)

        ctx.push(name).push(`(${id(this.stack)}, ${this.node.name}`)
        if (dynamic) {
            this.stack.last(NodeType.Tag)!.note.isDynamic = true
            this.node.values.forEach(it => {
                ctx.push(', ')
                if (it.type !== NodeType.Helper) ctx.push('H(')
                ctx.compileUp(it, this.stack)
                if (it.type !== NodeType.Helper) ctx.push(')')
            })
        } else {
        }
        ctx.push(')')
    }
}

export class BindingCompiler extends AbstractCompiler<Attribute> {
    compile (ctx: Context) {
        this.stack.last(NodeType.Tag)!.note.isDynamic = true
        put(this.stack, 'BD')
        const v = this.node.values.map(it => it.toHTMLString()).join('') || this.node.name
        ctx.push(`BD(${id(this.stack)}, ${this.node.name}, ${v}`)
    }
}

// only use first value, could be identifier or helper, no transform
export class EventCompiler extends AbstractCompiler<Attribute> {
    compile (ctx: Context) {
        this.stack.last(NodeType.Tag)!.note.isDynamic = true
        put(this.stack, 'EV')
        const v = this.node.values[0]!  // TODO throw

        ctx.push(`EV(${id(this.stack)}, ${this.node.name}`)
        if (v.type === NodeType.IdentifierValue) {
            ctx.push(', ').push(v.toHTMLString()).push(')')
            return
        }

        if (v.type === NodeType.Helper) {
            const h = v as Helper
            ctx.push(h.name)
            // TODO throw
            h.attributes.filter(it => it.type !== NodeType.TransformValue).forEach(it => {
                ctx.push(', ')
                ctx.compileUp(it, this.stack)
            })
            ctx.push(')')
        }

        // TODO throw
    }
}
