import { Compiler } from './compiler'
import { Tag } from './tag'

export class ModuleCompiler extends Compiler {
    views: string[]
    modules: {[name: string]: {path: string, loader?: {name: string, args?: string[]}}}

    initChildren () {
        if (this.tag.attributes) this.initItems()
        this.context.references = this.views.concat(Object.keys(this.modules))
        super.initChildren()
    }

    initItems () {
        this.views = []
        this.modules = {}

        this.tag.attributes.forEach(it => {
            if (!it.name) {
                this.views.push(it.value[0].value + '')
                return
            }

            if (it.value.length === 1) {
                this.modules[it.name] = {path: it.value[0].value + ''}
                return
            }

            if (it.value.length === 2 && it.value[0].minor === 'helper') {
                this.modules[it.name] = {
                    path: it.value[1].value + '',
                    loader: {
                        name: it.name,
                        args: (it.value[0] as Sleet.Helper).attributes.map(it => it.value[0].value + '')
                    }
                }
            }
        })
    }

    doCompile () {
        this.context.start(`import {ModuleTemplate} from 'drizzle'`)
        this.context.init(`const ${this.id} = new ModuleTemplate()`)
        this.children.forEach(it => it.doCompile())
        this.context.connect(`${this.id}.nodes = [${this.children.map(it => it.id).join(', ')}]`)
        this.context.connect(`${this.id}.views(${this.views.map(it => `'${it}'`).join(', ')})`)
        Object.keys(this.modules).forEach(it => {
            const {path, loader} = this.modules[it]
            let s = ''
            if (loader) {
                s = `, '${loader.name}', [${loader.args.map(it => `'${it}'`).join(', ')}]`
            }
            this.context.connect(`${this.id}.module('${it}', '${path}'${s})`)
        })
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
        this.context.start(`import {ViewTemplate} from 'drizzle'`)
        this.context.init(`const ${this.id} = new ViewTemplate()`)
        this.children.forEach(it => it.doCompile())
        this.context.connect(`${this.id}.nodes = [${this.children.map(it => it.id).join(', ')}]`)
    }
}
