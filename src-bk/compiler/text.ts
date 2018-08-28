import { Compiler } from './compiler'
import { Html5Entities as HTML } from 'html-entities'

export class TextCompiler extends Compiler {
    doCompile () {
        const tx = this.tag.sleet.text.map(it => HTML.decode(it).replace(/'/g, '\\\'')).join('\\n')
        this.context.init(`const ${this.id} = ${this.f('TX')}('${tx}')`)
    }
}
