import { Tag } from './tag'
import { Context } from './context'

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

    initChildren () {
        let i = 0
        while (this.tag.children[i]) {
            const compiler = this.context.create(this.tag.children[i], this)
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

    abstract doCompile ()
}
