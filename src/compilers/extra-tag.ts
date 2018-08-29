import { AbstractCompiler, Tag, Context } from 'sleet'
import { next, id, put } from './tag-factory'

export class EachTagCompiler extends AbstractCompiler<Tag> {
    compile (context: Context, elseBlock?: Tag) {
        const stack = this.stack.concat(this.node.extra)
        const tid = next(this.stack)
        const sub = context.compile(this.node, stack)!
        context.eol().indent().push(`const ${tid} = () => {`)
        sub.mergeUp()
        context.eol().indent(1).push(`return ${id(stack)}`)
        context.eol().indent().push(`}`)

        let fid: string = ''
        if (elseBlock) {
            context.compileUp(elseBlock, stack)
            fid = `, ${id(stack)}`
        }

        put(stack, 'EACH')
        context.eol().indent()

        context.push(`const ${next(stack)} = EACH([`)
        context.push(this.node.extra.values.map(it => it.toHTMLString()).join(', '))
        context.push('], ', tid, fid)
    }
}

export class IfTagCompiler extends AbstractCompiler<Tag> {
    compile (ctx: Context, ...elseBlocks: Tag[]) {
        const stack = this.stack.concat(this.node.extra)

        let eid = ''
        if (elseBlocks.length) {
            const compiler = ctx.create(elseBlocks[0], stack)!
            const sub = ctx.sub(-1)
            compiler.compile(sub, ...elseBlocks.slice(1))
            sub.mergeUp()
            eid = `, ${id(stack)}`
        }

        ctx.compileUp(this.node, stack, -1)
        const tid = id(stack)

        put(stack, 'IFC')
        ctx.push(`const ${next(stack)} = IFC([`)
        this.node.extra.values.forEach((it, idx) => {
            ctx.compileUp(it, stack)
            if (idx) ctx.push(', ')
        })
        ctx.pop()
        ctx.push(`], ${tid}${eid}`)
    }
}
