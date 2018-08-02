import { Compiler } from './compiler'
import { Tag } from './tag'

export class ModuleCompiler extends Compiler {
    doCompile () {
        this.context.start(`import {ModuleTemplate} from 'drizzle'`)
        this.context.init(`const ${this.id} = new ModuleTemplate()`)
        this.children.forEach(it => it.doCompile())
        this.context.connect(`${this.id}.nodes = [${this.children.map(it => it.id).join(', ')}]`)
    }
}
