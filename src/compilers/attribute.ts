import {
    AbstractCompiler, NodeType, SleetNode, SleetStack, Compiler,
    Context, Attribute, Helper, SleetValue, StringValue
} from 'sleet'
import { put, id } from './tag'

export class AttributeCompilerFactory extends AbstractCompiler<Attribute> {
    static type = NodeType.Attribute
    static create (node: SleetNode, stack: SleetStack): Compiler | undefined {
        const attr = node as Attribute

        if (attr.namespace) {
            if (attr.namespace === 'on') return new EventCompiler(attr, stack)
            if (attr.namespace === 'action') return new ActionCompiler(attr, stack)
            if (attr.namespace === 'comp') return new ComponentCompiler(attr, stack)
            if (attr.namespace === 'bind') return new BindingCompiler(attr, stack)
        }

        return new AttributeCompiler(node as Attribute, stack)
    }

    compile () {}
}

export class AttributeCompiler extends AbstractCompiler<Attribute> {
    compile (ctx: Context) {
        const dynamic = this.node.values.some(it =>
            it.type === NodeType.IdentifierValue || it.type === NodeType.Helper)

        const name = dynamic ? 'DA' : 'SA'
        put(this.stack, name)

        ctx.push(name).push(`(${id(this.stack)}, '${this.node.name || ''}'`)
        if (dynamic) {
            this.stack.last(NodeType.Tag)!.note.isDynamic = true
            this.node.values.forEach(it => {
                ctx.push(', ')
                if (it.type !== NodeType.Helper) {
                    put(this.stack, 'H')
                    ctx.push('H(')
                }
                ctx.compileUp(it, this.stack)
                if (it.type !== NodeType.Helper) ctx.push(')')
            })
        } else {
            if (this.node.values.length === 1) {
                const v = this.node.values[0]
                if (v instanceof StringValue) ctx.push(`, '${v.value}'`)
                else ctx.push(`, ${(v as SleetValue<any>).value}`)
            } else {
                const v = this.node.values.map(it => (it as SleetValue<any>).value)
                    .join(this.node.name === 'class' ? ' ' : '')
                ctx.push(`, '${v}'`)
            }
        }
        ctx.push(')')
    }
}

// can only bind a identifier value, TODO support obj[attri.bute]
export class BindingCompiler extends AbstractCompiler<Attribute> {
    compile (ctx: Context) {
        this.stack.last(NodeType.Tag)!.note.isDynamic = true
        put(this.stack, 'BD')
        const v = this.node.values[0]
        if (v && v.type !== NodeType.IdentifierValue) {
            // TODO throw
        }

        const vv = v ? v.toHTMLString() : this.node.name
        ctx.push(`BD(${id(this.stack)}, ${this.node.name}, ${vv})`)
    }
}

// only use first value, could be identifier or helper
export class EventCompiler extends AbstractCompiler<Attribute> {
    name = 'EV'
    compile (ctx: Context) {
        this.stack.last(NodeType.Tag)!.note.isDynamic = true
        put(this.stack, this.name)
        const v = this.node.values[0]!  // TODO throw if have multiple values

        ctx.push(`${this.name}(${id(this.stack)}, '${this.node.name}'`)
        if (v.type === NodeType.IdentifierValue) {
            ctx.push(`, '${v.toHTMLString()}')`)
            return
        }

        if (v.type === NodeType.Helper) {
            const h = v as Helper
            ctx.push(`, '${h.name}'`)
            h.attributes.forEach(it => {
                ctx.push(', ')
                ctx.compileUp(it, this.stack)
            })
            ctx.push(')')
        }

        // TODO throw
    }
}

export class ActionCompiler extends EventCompiler {
    name = 'AC'
}

export class ComponentCompiler extends AbstractCompiler<Attribute> {
    compile (ctx: Context) {
        this.stack.last(NodeType.Tag)!.note.isDynamic = true
        put(this.stack, 'CO')
        ctx.push(`CO(${id(this.stack)}, ${this.node.name}`)
        this.node.values.forEach(it => {
            ctx.push(', ')
            if (it.type !== NodeType.Helper) {
                put(this.stack, 'H')
                ctx.push('H(')
            }
            ctx.compileUp(it, this.stack)
            if (it.type !== NodeType.Helper) ctx.push(')')
        })
        ctx.push(')')
    }
}
