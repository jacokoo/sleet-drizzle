import {
    AbstractCompiler, Tag, NodeType, SleetNode, SleetStack,
    Compiler, Context, StaticText, DynamicText
} from 'sleet'
import { Html5Entities as HTML } from 'html-entities'
import { next, put } from './util'

export class TextCompiler extends AbstractCompiler<Tag> {
    static type = NodeType.Tag
    static create (node: SleetNode, stack: SleetStack): Compiler | undefined {
        if ((node as Tag).name === '|') return new TextCompiler(node as Tag, stack)
    }

    compile (ctx: Context) {
        if (!this.node.text.length) return
        const ii = next(this.stack)
        put(this.stack, 'TX')
        ctx.eol().indent().push(`const ${ii} = TX(`)
        this.node.text.filter(it => !!it.length).forEach(line => {
            line.forEach(item => {
                ctx.compileUp(item, this.stack)
                ctx.push(', ')
            })
            ctx.pop().push(`, '\\n'`)
        })
        ctx.pop().push(')')
        return ii
    }
}

export class StaticTextCompiler extends AbstractCompiler<StaticText> {
    static type = NodeType.StaticText
    static create (node: SleetNode, stack: SleetStack): Compiler | undefined {
        return new StaticTextCompiler(node as StaticText, stack)
    }

    compile (context: Context) {
        context.push(`'${HTML.decode(this.node.toHTMLString())}'`)
    }
}

export class DynamicTextCompiler extends AbstractCompiler<DynamicText> {
    static type = NodeType.DynamicText
    static create (node: SleetNode, stack: SleetStack): Compiler | undefined {
        return new DynamicTextCompiler(node as DynamicText, stack)
    }

    compile (context: Context) {
        const i = this.node.value.type === NodeType.IdentifierValue
        if (i) {
            put(this.stack, 'H')
            context.push('H(')
        }
        context.compileUp(this.node.value, this.stack)
        if (i) context.push(')')
    }
}
