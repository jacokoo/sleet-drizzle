import { Tag } from './tag'
import { EachCompiler } from './each-compiler'
import { ModuleCompiler, ViewCompiler } from './template'
import { TagCompiler } from './tag-compiler'
import { IfCompiler } from './if-compiler'
import { Compiler } from './compiler'
import { TextCompiler } from './text-compiler'
import { ReferenceCompiler } from './reference-compiler'
import { RegionCompiler } from './region-compiler'

export class Context {
    id: number = 0
    indent: number = 0
    ctx: Sleet.Context
    isRoot = true
    isView = false
    references: string[] = []
    private factories: string[] = []
    private starts: string[] = []
    private inits: string[] = []
    private connects: string[] = []

    constructor(ctx: Sleet.Context) {
        this.ctx = ctx
    }

    create (tag: Tag, parent: Compiler) {
        if (tag.name === 'module') return new ModuleCompiler(this, tag, parent)
        if (tag.name === 'view') return new ViewCompiler(this, tag, parent)
        if (tag.name === '|') return new TextCompiler(this, tag, parent)
        if (tag.name === 'region') return new RegionCompiler(this, tag, parent)
        if (!tag.setting) return new TagCompiler(this, tag, parent)
        if (tag.setting.name === 'each') return new EachCompiler(this, tag, parent)
        if (tag.setting.name === 'if') return new IfCompiler(this, tag, parent)
        if (this.references.indexOf(tag.name) !== -1) return new ReferenceCompiler(this, tag, parent)
        throw new SyntaxError(`not supported setting ${tag.setting.name}`)
    }

    nextId (): string {
        return 'o' + (this.id++)
    }

    factory (...names: string[]) {
        names.forEach(name => {
            if (this.factories.indexOf(name) === -1) {
                this.factories.push(name)
            }
        })
    }

    start (code: string) {
        this.starts.push(`${this.indentIt()}${code}`)
    }

    init (code: string): void {
        this.inits.push(`${this.indentIt()}${code}`)
    }

    connect (code: string): void {
        this.connects.push(`${this.indentIt()}${code}`)
    }

    getOutput (): string {
        let output = []
        if (this.isRoot) {
            output.push(`import {factory} from 'drizzle'`)
            output.push(`const {${this.factories.join(', ')}} = factory`)
        }

        output = output.concat(this.starts)
        if (this.starts.length) output.push('')
        output = output.concat(this.inits)
        if (this.inits.length) output.push('')
        output = output.concat(this.connects)
        if (this.connects.length) output.push('')

        return output.join(this.ctx._newlineToken)
    }

    isReference (name: string) {
        return this.references.indexOf(name) !== -1
    }

    sub (): Context {
        const c = new Context(this.ctx)
        c.indent = this.indent + 1
        c.nextId = () => this.nextId()
        c.factory = (...args: string[]) => this.factory(...args)
        c.isRoot = false
        c.isView = this.isView
        c.isReference = (name: string) => this.isReference(name)
        return c
    }

    private indentIt (): string {
        let idt = ''
        for (let i = 0; i < this.indent; i ++) {
            idt += this.ctx._indentToken
        }
        return idt
    }
}
