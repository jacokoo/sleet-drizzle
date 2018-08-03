import { Compiler } from './compiler'

export class RegionCompiler extends Compiler {
    doCompile () {
        const id = this.tag.id ? `'${this.tag.id}'` : ''
        this.context.init(`const ${this.id} = ${this.f('RG')}(${id})`)
        super.doCompile()
    }
}
