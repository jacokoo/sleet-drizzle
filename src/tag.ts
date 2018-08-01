import { Context } from './sleet-drizzle'

export class TagCompiler {
    context: Context
    tag: Sleet.Tag
    parent: TagCompiler
    id: string
    children: TagCompiler[] = []

    constructor (context: Context, tag: Sleet.Tag, parent: TagCompiler) {
        this.tag = tag
        this.context = context
        this.parent = parent
        this.id = context.nextId()

        this.children = tag.children.map(it => new TagCompiler(context, it, this))

        let p = this as TagCompiler
        let c: TagCompiler
        let haveInlineChild = false
        tag.inlines.forEach((it, i) => {
            if (it.inlineChar === '>' || it.inlineChar === ':') {
                c = new TagCompiler(context, it, p)
                p.children.push(c)
                p = c
                haveInlineChild = true
                return
            }

            if (it.inlineChar === '+') {
                c = new TagCompiler(context, it, p.parent)
                p.parent.children.push(c)
                p = c
                return
            }

            if (it.inlineChar === '<' && haveInlineChild) {
                c = new TagCompiler(context, it, p.parent.parent)
                p.parent.parent.children.push(c)
                p = c
                return
            }

            throw new SyntaxError(`Invalid inline char: ${it.inlineChar} in Tag: ${it.name}`)
        })
    }

}
