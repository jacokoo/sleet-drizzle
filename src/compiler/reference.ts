import { TagCompiler } from './tag'

export class ReferenceCompiler extends TagCompiler {

    doCompile () {
        this.tag.attributes.forEach(it => this.doAttribute(it))
        this.context.factory('REF')

        const na = `'${this.tag.name}'`
        const id = this.tag.id ? `'${this.tag.id}'` : null
        const bi = `[${this.binds.join(', ')}]`
        const ev = `[${this.events.join(', ')}]`
        const ac = `[${this.actions.join(', ')}]`
        this.context.init(`const ${this.id} = REF(${na}, ${id}, ${bi}, ${ev}, ${ac})`)

        super.doCompile()
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
        this.context.factory('KV')
        this.binds.push(attr.name ?
            `KV('${attr.name}', '${attr.value[0].value}')` :
            `KV('${attr.value[0].value}')`)
    }
}
