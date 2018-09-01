import {
    AbstractCompiler, Tag, Context, NodeType, SleetNode, SleetStack,
    Compiler, AttributeGroup, StringValue, Attribute
} from 'sleet'
import { EachTagCompiler, IfTagCompiler } from './extra-tag'
import { next, compileNodes, put } from './util'

const create = (tag: Tag, stack: SleetStack): Compiler | undefined => {
    const refs = stack.note('references') as string[]
    if (tag.name && refs.indexOf(tag.name) !== -1) return new ReferenceCompiler(tag, stack)
    return new NormalTagCompiler(tag, stack)
}

export class NormalTagCompiler extends AbstractCompiler<Tag> {
    static type = NodeType.Tag
    static create (node: SleetNode, stack: SleetStack): Compiler | undefined {
        const tag = node as Tag
        if (!tag.extra) return create(tag, stack)

        const last = stack.last()
        if (last && last.node === node) {
            return create(tag, stack)
        }
        if (!last || last.node.type !== NodeType.TagExtra) {
            if (tag.extra.name === 'each') return new EachTagCompiler(tag, stack)
            if (tag.extra.name === 'if') return new IfTagCompiler(tag, stack)
        }

        if (last && last.node.type === NodeType.TagExtra && tag.extra.name === 'elseif') {
            return new IfTagCompiler(tag, stack)
        }

        return create(tag, stack)
    }

    compile (ctx: Context) {
        const ii = next(this.stack)

        const name = this.nodeType()
        const subs = this.mergeGroup().attributes.map(it => ctx.compile(it, this.stack, -1))
        put(this.stack, name)
        ctx.eol().indent().push(`const ${ii} = ${name}('${this.node.name || 'div'}'`)
        if (this.node.hash) ctx.push(`, '${this.node.hash}'`)
        ctx.push(')')
        subs.forEach(it => {
            if (!it) return
            ctx.eol().indent()
            it.mergeUp()
        })

        const ids = compileNodes(ctx, this.stack, this.node.children)

        if (ids.length) {
            put(this.stack, 'C')
            ctx.eol().indent().push(`C(${ii}, ${ids.join(', ')})`)
        }
        return ii
    }

    nodeType (): string {
        const last = this.stack.last()!
        const name = last.note.isDynamic ? 'DN' : 'SN'
        return name
    }

    mergeGroup (): AttributeGroup {
        const location = {
            start: {line: 0, column: 0, offset: 0},
            end: {line: 0, column: 0, offset: 0}
        }
        if (this.node.dots.length) {
            const vs = this.node.dots.map(it => new StringValue(it, location))
            const group = new AttributeGroup([new Attribute(undefined, 'class', vs, location)], undefined, location)
            if (this.node.attributeGroups.length) group.merge(this.node.attributeGroups[0])
            return group
        }

        return this.node.attributeGroups[0] || new AttributeGroup([], undefined, location)
    }
}

export class CommentCompiler extends AbstractCompiler<Tag> {
    static type = NodeType.Tag
    static create (node: SleetNode, stack: SleetStack): Compiler | undefined {
        if ((node as Tag).name === '#') return new CommentCompiler(node as Tag, stack)
    }

    compile () {
    }
}

export class RegionCompiler extends AbstractCompiler<Tag> {
    static type = NodeType.Tag
    static create (node: SleetNode, stack: SleetStack): Compiler | undefined {
        if ((node as Tag).name === 'region') return new RegionCompiler(node as Tag, stack)
    }

    compile (ctx: Context) {
        put(this.stack, 'RG')
        const ii = next(this.stack)
        ctx.push(`const ${ii} = RG(${this.node.hash || ''})`)
        return ii
    }
}

class ReferenceCompiler extends NormalTagCompiler {
    static type = NodeType.Tag
    static create (node: SleetNode, stack: SleetStack): Compiler | undefined {
        const refs = stack.note('references') as string[]
        const tag = node as Tag
        if (tag.name && refs.indexOf(tag.name) !== -1) return new ReferenceCompiler(tag, stack)
    }

    nodeType () {
        this.stack.last()!.note.isReference = true
        return 'REF'
    }
}
