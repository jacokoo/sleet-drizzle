import { TagCompiler } from './tag'

export class ReferenceCompiler extends TagCompiler {

    doCompile () {
        this.tag.attributes.forEach(it => this.doAttribute(it))
        this.context.factory('REF')

        const na = `'${this.tag.name}'`
        const id = this.tag.id ? `, '${this.tag.id}'` : ''
        this.context.init(`const ${this.id} = REF(${na}${id})`)
        this.inits.forEach(it => this.context.init(it))

        this.compileChildren()
    }

    doAttribute (attr: Sleet.Attribute): void {
        if (attr.namespace) {
            if (attr.namespace === 'on') return this.doEvent(attr)
            if (attr.namespace === 'action') return this.doAction(attr)
            throw new SyntaxError(`attribute namespace ${attr.namespace} in refernece node is not supported`)
        }

        this.doBind(attr)
    }

    doBind (attr: Sleet.Attribute) {
        this.context.factory('BD')
        this.inits.push(attr.name ?
            `BD(${this.id}, '${attr.name}', '${attr.value[0].value}')` :
            `BD(${this.id}, '${attr.value[0].value}', '${attr.value[0].value}')`)
    }
}
