import { Compiler } from './compiler'
import { Tag } from '../tag'
import { TagCompiler } from './tag'
import { Context } from '../context'

export class EachCompiler extends Compiler {
    trueBlock: Compiler
    falseBlock: Compiler
    sub: Context
    trueId: string

    initChildren () {
        this.trueId = this.context.nextId()
        this.sub = this.context.sub()
        this.trueBlock = new TagCompiler(this.sub, this.tag, this)
    }

    consumeSibling (tag: Tag, i: number, list: Tag[]): number {
        if (!tag.setting || tag.setting.name !== 'else') return i
        delete tag.setting
        this.falseBlock = this.context.create(tag, this)
        return i + 1
    }

    doCompile () {
        this.context.init(`const ${this.trueId} = () => {`)

        this.trueBlock.doCompile()
        this.sub.connect(`return ${this.trueBlock.id}`)
        this.context.init(this.sub.getOutput())

        this.context.init('}')

        if (this.falseBlock) this.falseBlock.doCompile()
        let fs = ''
        if (this.falseBlock) {
            fs = `, ${this.falseBlock.id}`
        }

        const attrs = this.tag.setting.attributes.map(it => '\'' + it.value[0].value + '\'')
        this.context.init(`const ${this.id} = ${this.f('EACH')}([${attrs.join(', ')}], ${this.trueId}${fs})`)
    }

}
