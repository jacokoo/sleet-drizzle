import { AbstractCompiler, Tag, Context, NodeType, SleetNode, SleetStack, Compiler } from 'sleet'

export function put (stack: SleetStack, name: string) {
    const o = stack.note('factories') as string[]
    o.push(name)
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

export class TagCompilerFactory {
    static type: NodeType.Tag
    static create (node: SleetNode, stack: SleetStack): Compiler | undefined {
        if (!(node as Tag).extra) return new NormalTagCompiler(node as Tag, stack)

        const last = stack.last()
        if (!last || last.node.type !== NodeType.TagExtra) {
            return new TagExtraCompiler(node as Tag, stack)
        }

        return new NormalTagCompiler(node as Tag, stack)
    }
}

class NormalTagCompiler extends AbstractCompiler<Tag> {
    compile (context: Context) {
    }
}

class TagExtraCompiler extends AbstractCompiler<Tag> {
    compile (context: Context, elseBlock?: Tag) {
        const to = next(this.stack)
        const sub = context.compile(this.node, this.stack)!
        context.eol().indent().push(`const ${to} = () => {`)
        sub.mergeUp()
        context.eol().indent(1).push(`return ${id(this.stack)}`)
        context.eol().indent().push(`}`)

        let fo: string = ''
        if (elseBlock) {
            context.compileUp(elseBlock, this.stack)
            fo = id(this.stack)
        }
        const eo = id(this.stack)

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
