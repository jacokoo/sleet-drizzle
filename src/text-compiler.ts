import { Compiler } from './compiler'

export class TextCompiler extends Compiler {
    doCompile () {
        const tx = this.tag.sleet.text.map(it => it.replace(/'/g, '\\\'')).join('\\n')
        this.context.init(`const ${this.id} = ${this.f('TX')}('${tx}')`)
    }
}
