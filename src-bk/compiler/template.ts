import { Compiler } from './compiler'
import { Context } from '../context'

export class ModuleCompiler extends Compiler {
    exportedModels: string[]
    sub: Context

    initChildren () {
        if (this.tag.attributes) {
            this.exportedModels = this.tag.attributes.map(it => `'${it.value[0].value as string}'`)
        }
        this.sub = this.context.sub()
        super.initChildren(this.sub)
    }

    doCompile () {
        this.id = 'template'
        this.context.start(`import {ModuleTemplate} from 'drizzlejs'`)
        this.context.init(`const ${this.id} = new ModuleTemplate([${this.exportedModels.join(', ')}])`)
        this.children.forEach(it => it.doCompile())
        this.context.init(`const ${this.id}Nodes = () => {`)
        this.context.init(this.sub.getOutput())
        this.context.init(`    return [${this.children.map(it => it.id).join(', ')}]`)
        this.context.init(`}`)
        this.context.connect(`${this.id}.creator = ${this.id}Nodes`)
    }
}

export class ViewCompiler extends Compiler {
    sub: Context
    initChildren () {
        if (this.tag.attributes) {
            this.context.references = this.tag.attributes.map(it => it.value[0].value as string)
        }
        this.sub = this.context.sub()
        super.initChildren(this.sub)
    }

    doCompile () {
        this.id = 'template'

        this.context.start(`import {ViewTemplate} from 'drizzlejs'`)
        this.context.init(`const ${this.id} = new ViewTemplate()`)
        this.children.forEach(it => it.doCompile())
        this.context.init(`const ${this.id}Nodes = () => {`)
        this.context.init(this.sub.getOutput())
        this.context.init(`    return [${this.children.map(it => it.id).join(', ')}]`)
        this.context.init(`}`)
        this.context.connect(`${this.id}.creator = ${this.id}Nodes`)
    }
}
