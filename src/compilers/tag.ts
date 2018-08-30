import {
    AbstractCompiler, Tag, Context, NodeType, SleetNode, SleetStack,
    Compiler, AttributeGroup, StringValue, Attribute
} from 'sleet'
import { EachTagCompiler, IfTagCompiler } from './extra-tag'

export function put (stack: SleetStack, name: string) {
    const o = stack.note('factories') as string[]
    if (o.indexOf(name) === -1) o.push(name)
}

export function next (stack: SleetStack) {
    const o = stack.note('counter') as {count: number}
    o.count ++
    return `o${o.count}`
}

export function id (stack: SleetStack) {
    const o = stack.note('counter') as {count: number}
    return `o${o.count}`
}

export function compileNodes (ctx: Context, stack: SleetStack, tags: Tag[]): string[] {
    let i = 0
    const ids: string[] = []

    while (i < tags.length) {
        const tag = tags[i]
        let n = tags[i + 1]
        const { start } = tag.location

        if (!n || !n.extra || (n.extra.name !== 'else' && n.extra.name !== 'elseif')) {
            i ++
            const c = ctx.create(tag, stack)!
            const s = ctx.sub(-1)
            ids.push(c.compile(s))
            s.mergeUp()
            continue
        }

        if (!tag.extra) {
            throw new SyntaxError(`not paired else/elseif, line: ${start.line}, column: ${start.column}`)
        }

        const sub = ctx.sub(-1)
        if (tag.extra.name === 'each') {
            if (n.extra.name !== 'else') {
                throw new SyntaxError(`each can not have elseif block, line: ${start.line}, column: ${start.column}`)
            }

            const compiler = ctx.create(tag, stack)
            ids.push(compiler.compile(sub, n))
            sub.mergeUp()
            i += 2
            continue
        }

        const blocks = []
        i ++
        while (n && n.extra && n.extra.name === 'elseif') {
            blocks.push(n)
            i ++
            n = tags[i]
        }

        if (n && n.extra && n.extra.name === 'else') {
            blocks.push(n)
            i ++
        }
        const cc = ctx.create(tag, stack)
        ids.push(cc.compile(sub, ...blocks))
        sub.mergeUp()
    }

    return ids.filter(it => !!it)
}

const create = (tag: Tag, stack: SleetStack): Compiler | undefined => {
    const refs = stack.note('references') as string[]
    if (refs.indexOf(tag.name) !== -1) return new ReferenceCompiler(tag, stack)
    return new NormalTagCompiler(tag, stack)
}

export class NormalTagCompiler extends AbstractCompiler<Tag> {
    static type = NodeType.Tag
    static create (node: SleetNode, stack: SleetStack): Compiler | undefined {
        const tag = node as Tag
        if (!tag.extra) return create(tag, stack)

        const last = stack.last()
        if (last.node === node) {
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

        const subs = this.mergeGroup().attributes.map(it => ctx.compile(it, this.stack, -1))
        const name = this.nodeType()
        put(this.stack, name)
        ctx.eol().indent().push(`const ${ii} = ${name}('${this.node.name || 'div'}'`)
        if (this.node.hash) ctx.push(`, '${this.node.hash}'`)
        ctx.push(')')
        subs.forEach(it => {
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
            const group = new AttributeGroup([new Attribute(null, 'class', vs, location)], null, location)
            if (this.node.attributeGroups.length) group.merge(this.node.attributeGroups[0])
            return group
        }

        return this.node.attributeGroups[0] || new AttributeGroup([], null, location)
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
        if (refs.indexOf((node as Tag).name) !== -1) return new ReferenceCompiler(node as Tag, stack)
    }

    nodeType () {
        return 'REF'
    }
}
