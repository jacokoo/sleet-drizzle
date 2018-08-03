import { Compiler } from './compiler'
import { Tag } from './tag'

export class ModuleCompiler extends Compiler {
    exportedModels: string[]

    initChildren () {
        if (this.tag.attributes) {
            this.exportedModels = this.tag.attributes.map(it => `'${it.value[0].value as string}'`)
        }
        super.initChildren()
    }

    doCompile () {
        this.id = 'template'
        this.context.start(`import {ModuleTemplate} from 'drizzle'`)
        this.context.init(`const ${this.id} = new ModuleTemplate([${this.exportedModels.join(', ')}])`)
        this.children.forEach(it => it.doCompile())
        this.context.connect(`${this.id}.nodes = [${this.children.map(it => it.id).join(', ')}]`)
    }
}

export class ViewCompiler extends Compiler {
    initChildren () {
        if (this.tag.attributes) {
            this.context.references = this.tag.attributes.map(it => it.value[0].value as string)
        }
        super.initChildren()
    }

    doCompile () {
        this.id = 'template'

        this.context.start(`import {ViewTemplate} from 'drizzle'`)
        this.context.init(`const ${this.id} = new ViewTemplate()`)
        this.children.forEach(it => it.doCompile())
        this.context.connect(`${this.id}.nodes = [${this.children.map(it => it.id).join(', ')}]`)
    }
}
