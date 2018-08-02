import { Compiler } from './compiler'
import { Tag } from './tag'
import { TagCompiler } from './tag-compiler'

export class IfCompiler extends Compiler {
    trueBlock: Compiler
    falseBlock: Compiler

    factory = 'IFC'
    elseIf = 'elseif'

    initChildren () {
        this.trueBlock = new TagCompiler(this.context, this.tag, this)
    }

    consumeSibling (tag: Tag, i: number, list: Tag[]): number {
        if (!tag.setting) return i
        if (this.elseIf && tag.setting.name === this.elseIf) {
            this.falseBlock = new IfCompiler(this.context, tag, this)
            if (!list[i + 1]) return i + 1
            return this.falseBlock.consumeSibling(list[i + 1], i + 1, list)
        }
        if (tag.setting.name === 'else') {
            delete tag.setting
            this.falseBlock = this.context.create(tag, this)
            return i + 1
        }
        return i
    }

    doCompile () {
        this.trueBlock.doCompile()
        if (this.falseBlock) this.falseBlock.doCompile()
        this.context.factory(this.factory)

        let fs = ''
        if (this.falseBlock) fs = `, ${this.falseBlock.id}`
        const attrs = this.tag.setting.attributes.map(it => {
            const v = it.value[0]
            if (v.minor === 'identifier') return `${this.f('DV')}('${v.value}')`
            if (v.minor === 'quoted') return `${this.f('SV')}('${v.value}')`
            return `${this.f('SV')}(${v.value})`
        })
        this.context.init(`const ${this.id} = ${this.factory}([${attrs.join(', ')}], ${this.trueBlock.id}${fs})`)
    }
}

export class UnlessCompiler extends IfCompiler {
    factory = 'UN'
    elseIf = ''
}
