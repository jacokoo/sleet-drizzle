import { Tag } from '../tag'
import { Context } from '../context'

export abstract class Compiler {
    tag: Tag
    context: Context
    parent: Compiler
    id: string
    children: Compiler[] = []

    constructor (context: Context, tag: Tag, parent: Compiler) {
        this.context = context
        this.tag = tag
        this.parent = parent
        this.id = context.nextId()

        this.initChildren()
    }

    initChildren (context?: Context) {
        let i = 0
        const ctx = context || this.context
        while (this.tag.children[i]) {
            const compiler = ctx.create(this.tag.children[i], this)
            this.children.push(compiler)
            i = i + 1
            const c = this.tag.children[i]
            if (c) i = compiler.consumeSibling(c, i, this.tag.children)
        }
    }

    consumeSibling (tag: Tag, i: number, list: Tag[]): number {
        return i
    }

    f (str: string) {
        this.context.factory(str)
        return str
    }

    compileChildren () {
        this.children.forEach(it => it.doCompile())
        if (this.children.length) {
            this.context.connect(`C(${this.id}, ${this.children.map(it => it.id).join(', ')})`)
        }
    }

    doCompile () {
        this.compileChildren()
    }
}
