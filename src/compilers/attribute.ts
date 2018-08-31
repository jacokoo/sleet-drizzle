import {
    AbstractCompiler, NodeType, SleetNode, SleetStack, Compiler,
    Context, Attribute, Helper, SleetValue, StringValue, IdentifierValue
} from 'sleet'
import { put, id } from './tag'

export class AttributeCompilerFactory extends AbstractCompiler<Attribute> {
    static type = NodeType.Attribute
    static create (node: SleetNode, stack: SleetStack): Compiler | undefined {
        const attr = node as Attribute

        const ref = stack.last(NodeType.Tag)!.note.isReference
        if (attr.namespace) {
            if (attr.namespace === 'on') return new EventCompiler(attr, stack)
            if (attr.namespace === 'action') return new ActionCompiler(attr, stack)
            // TODO throw if ref is true
            if (attr.namespace === 'comp' && !ref) return new ComponentCompiler(attr, stack)
            if (attr.namespace === 'bind') return new BindingCompiler(attr, stack)
        }

        const dynamic = attr.values.some(it => it.type === NodeType.IdentifierValue || it.type === NodeType.Helper)
        if (dynamic) {
            return ref ? new ReferenceDynamicAttributeCompiler(attr, stack) : new DynamicAttributeCompiler(attr, stack)
        }
        return new StaticAttributeCompiler(attr, stack)
    }

    compile () {}
}

// no helper, only use first value and only can be identifier value
class ReferenceDynamicAttributeCompiler extends AbstractCompiler<Attribute> {
    compile (ctx: Context) {
        put(this.stack, 'MP')
        ctx.push(`MP(${id(this.stack)}`)

        const v = this.node.values[0]
        if (!v || v.type !== NodeType.IdentifierValue) {
            // TODO throw
        }

        const vv = (v as IdentifierValue).value
        ctx.push(`, '${vv}'`)
        if (this.node.name) ctx.push(`, ${this.node.name}`)
        ctx.push(')')
    }
}

class DynamicAttributeCompiler extends AbstractCompiler<Attribute> {
    compile (ctx: Context) {
        this.stack.last(NodeType.Tag)!.note.isDynamic = true

        put(this.stack, name)
        ctx.push(`DA(${id(this.stack)}, '${this.node.name || ''}'`)

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

class StaticAttributeCompiler extends AbstractCompiler<Attribute> {
    compile (ctx: Context) {
        put(this.stack, 'SA')
        ctx.push(`SA(${id(this.stack)}, '${this.node.name || ''}'`)

        if (this.node.values.length === 1) {
            const v = this.node.values[0]
            if (v instanceof StringValue) ctx.push(`, '${v.value}'`)
            else ctx.push(`, ${(v as SleetValue<any>).value}`)
        } else {
            const v = this.node.values.map(it => (it as SleetValue<any>).value)
                .join(this.node.name === 'class' ? ' ' : '')
            ctx.push(`, '${v}'`)
        }
        ctx.push(')')
    }
}

// can only bind a identifier value, TODO support obj[attri.bute]
class BindingCompiler extends AbstractCompiler<Attribute> {
    compile (ctx: Context) {
        this.stack.last(NodeType.Tag)!.note.isDynamic = true
        put(this.stack, 'BD')
        const v = this.node.values[0]
        if (v && v.type !== NodeType.IdentifierValue) {
            // TODO throw
        }

        const vv = v ? v.toHTMLString() : this.node.name
        ctx.push(`BD(${id(this.stack)}, '${this.node.name}', '${vv}')`)
    }
}

// only use first value, could be identifier or helper
class EventCompiler extends AbstractCompiler<Attribute> {
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

class ActionCompiler extends EventCompiler {
    name = 'AC'
}

class ComponentCompiler extends AbstractCompiler<Attribute> {
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
