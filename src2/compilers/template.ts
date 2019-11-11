import { AbstractCompiler, Tag, NodeType, SleetNode, SleetStack, Compiler, Context } from 'sleet'
import { compileNodes } from './util'

abstract class RootCompiler extends AbstractCompiler<Tag> {
    static type = NodeType.Tag
    name: string

    constructor (node: Tag, stack: SleetStack) {
        super(node, stack)
    }

    compile (ctx: Context) {
        const imports = this.stack.note('imports') as string[]
        imports.push(`import { ${this.name} } from 'drizzlejs'`)
        ctx.eol().indent().push(`const template = new ${this.name}(${this.params()})`)
        ctx.eol().indent().push(`const templateNodes = () => {`)
        const sub = ctx.sub()
        const ids = compileNodes(sub, this.stack, this.node.children)
        sub.mergeUp()
        ctx.eol().indent(1).push(`return [${ids.join(', ')}]`)
        ctx.eol().indent().push('}')
        ctx.eol().indent().push('template.creator = templateNodes')
        ctx.eol()
    }

    params () {
        return ''
    }

    attributes () {
        return this.node.attributeGroups.map(it => it.attributes.map(a => a.values.map(v =>
            v.toHTMLString()).join(''))).reduce((acc, item) => {
                return acc.concat(item)
            }, [])
    }
}

export class ModuleCompiler extends RootCompiler {
    static create (node: SleetNode, stack: SleetStack): Compiler | undefined {
        const tag = node as Tag
        if (tag.indent !== 0) return
        if (tag.name === 'module') return new ModuleCompiler(tag, stack)
    }

    name = 'ModuleTemplate'

    params () {
        return `[${this.attributes().map(it => `'${it}'`)}]`
    }
}

export class ViewCompiler extends RootCompiler {
    static create (node: SleetNode, stack: SleetStack): Compiler | undefined {
        const tag = node as Tag
        if (tag.indent !== 0) return
        if (tag.name === 'view') return new ViewCompiler(tag, stack)
    }

    name = 'ViewTemplate'

    compile (ctx: Context) {
        const refs = this.stack.note('references') as string[]
        this.attributes().forEach(it => {
            if (refs.indexOf(it) === -1) refs.push(it)
        })
        super.compile(ctx)
    }
}
