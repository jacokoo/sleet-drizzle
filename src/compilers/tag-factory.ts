import { AbstractCompiler, Tag, Context, NodeType, SleetNode, SleetStack, Compiler, TagExtra } from 'sleet'
import { EachTagCompiler, IfTagCompiler } from './extra-tag'
import { NormalTagCompiler } from './tag'

export function put (stack: SleetStack, name: string) {
    const o = stack.note('factories') as string[]
    if (o.indexOf(name) === -1) o.push(name)
}

export function id (stack: SleetStack) {
    const o = stack.note('counter') as {count: number}
    return `o${o.count}`
}

export function next (stack: SleetStack) {
    const o = stack.note('counter') as {count: number}
    o.count ++
    return `o${o.count}`
}

export function compileNodes (ctx: Context, stack: SleetStack, tags: Tag[]) {
    let i = 0

    while (i < tags.length) {
        const tag = tags[i]
        let n = tags[i + 1]
        const { start } = tag.location

        if (!n || !n.extra || (n.extra.name !== 'else' && n.extra.name !== 'elseif')) {
            i ++
            ctx.compileUp(tag, stack, -1)
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
            compiler.compile(sub, n)
            sub.mergeUp()
            i += 2
            continue
        }

        const blocks = []
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
        cc.compile(sub, ...blocks)
        sub.mergeUp()
    }
}

export const TagCompilerFactory = {
    type: NodeType.Tag,
    create (node: SleetNode, stack: SleetStack): Compiler | undefined {
        const tag = node as Tag
        if (!tag.extra) return new NormalTagCompiler(tag, stack)

        const last = stack.last()
        if (!last || last.node.type !== NodeType.TagExtra) {
            if (tag.extra.name === 'each') return new EachTagCompiler(tag, stack)
            if (tag.extra.name === 'if') return new IfTagCompiler(tag, stack)
        }

        if (last && last.node.type === NodeType.TagExtra && tag.extra.name === 'elseif') {
            return new IfTagCompiler(tag, stack)
        }

        return new NormalTagCompiler(node as Tag, stack)
    }
}

export class CommentCompiler extends AbstractCompiler<Tag> {
    static type: NodeType.Tag
    static create (node: SleetNode, stack: SleetStack): Compiler | undefined {
        if ((node as Tag).name === '#') return new CommentCompiler(node as Tag, stack)
    }

    compile (context: Context) {
    }
}
