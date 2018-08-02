import { Compiler } from './compiler'

export class TagCompiler extends Compiler {
    statics: string[] = []
    dynamics: string[] = []
    binds: string[] = []
    events: string[] = []
    actions: string[] = []

    doCompile () {
        this.tag.attributes.forEach(it => this.doAttribute(it))

        let type = 'SN'
        if (this.dynamics.length || this.binds.length || this.events.length || this.actions.length) {
            type = 'DN'
        }
        const id = this.tag.id ? `'${this.tag.id}'` : null
        let st = this.statics.join(', ')
        const na = this.tag.name

        this.context.factory(type, 'C')
        if (type === 'SN') {
            if (this.statics.length) {
                st = ', ' + st
            }
            this.context.init(`const ${this.id} = SN('${na}', ${id}${st})`)
        } else {
            const dy = this.dynamics.join(', ')
            const bi = this.binds.join(', ')
            const ev = this.events.join(', ')
            const ac = this.actions.join(', ')
            this.context.init(`const ${this.id} = DN('${na}', ${id}, [${st}], [${dy}], [${bi}], [${ev}], [${ac}])`)
        }
        this.children.forEach(it => it.doCompile())
        if (this.children.length) {
            this.context.connect(`C(${this.id}, ${this.children.map(it => it.id).join(', ')})`)
        }
    }

    doAttribute (attr: Sleet.Attribute) {
        if (attr.namespace) {
            if (attr.namespace === 'on') return this.doEvent(attr)
            if (attr.namespace === 'action') return this.doAction(attr)
            if (attr.namespace === 'bind') return this.doBind(attr)
            throw new SyntaxError(`attribute namespace ${attr.namespace} is not supported`)
        }

        if (attr.value.some(it => it.minor === 'identifier' || it.minor === 'helper')) {
            return this.doDynamic(attr)
        }

        if (attr.value.length === 1 && attr.value[0].minor === 'identifier'
            && (attr.value[0].value as string).slice(0, 5) === 'bind:') {
                this.binds.push(`${this.f('KV')}('${attr.value[0].value}')`)
        }

        return this.doStatic(attr)
    }

    doEvent (attr: Sleet.Attribute) {
        this.context.factory('E')
        this.events.push(`E(${this.eventString(attr)})`)
    }

    doAction (attr: Sleet.Attribute) {
        this.context.factory('A')
        this.actions.push(`A(${this.eventString(attr)})`)
    }

    eventString (attr: Sleet.Attribute) {
        const v = attr.value[0]
        this.context.factory('AT', 'SV', 'NSA', 'DV', 'NDA')
        if (v.minor === 'helper') {
            const {name, attributes} = (v as Sleet.Helper)
            const vs = attributes.map(it => {
                const kk = it.name
                const vv = it.value[0]
                if (vv.minor === 'number' || vv.minor === 'boolean') {
                    return kk ? `AT('${kk}', SV(${vv.value}))` : `NSA(${vv.value})`
                }
                if (vv.minor === 'quoted') {
                    return kk ? `AT('${kk}', SV('${vv.value}'))` : `NSA('${vv.value}')`
                }
                return kk ? `AT('${kk}', DV('${vv.value}'))` : `NDA('${vv.value}')`
            }).join(', ')

            return `('${attr.name}', '${name}', ${vs})`
        }

        return `('${attr.name}', '${name}')`
    }

    doBind (attr: Sleet.Attribute) {
        this.context.factory('B')
        this.actions.push(`B('${attr.name}', '${attr.value[0].value}')`)
    }

    doDynamic (attr: Sleet.Attribute) {
        const {name, value} = attr
        const helpers = []

        let sts = []
        value.forEach(it => {
            if (it.minor === 'identifier') {
                if (sts.length) {
                    this.context.factory('H', 'SV')
                    helpers.push(`H(SV('${sts.join(name === 'class' ? ' ' : '')}'))`)
                    sts = []
                }
                helpers.push(`H('${it.value}')`)
            } else if (it.minor === 'helper') {
                this.context.factory('HH', 'DV', 'SV')
                const {name: n, attributes: ats} = (it as Sleet.Helper)
                const vv = ats.map(at => {
                    const vvv = at.value[0]
                    if (vvv.minor === 'number' || vvv.minor === 'boolean') return `SV(${vvv.value})`
                    if (vvv.minor === 'quoted') return `SV('${vvv.value}')`
                    return `DV('${vvv.value}')`
                }).join(', ')
                helpers.push(`HH('${n}', ${vv})`)
            } else {
                sts.push(it.value)
            }
        })

        this.dynamics.push(`DA(${name}, ${helpers.join(', ')})`)
    }

    doStatic (attr: Sleet.Attribute) {
        const vs = attr.value.map(it => it.value + '')
        const v = attr.name === 'class' ? vs.join(' ') : vs.join('')
        this.context.factory('KV')
        this.statics.push(attr.name ? `KV('${attr.name}', '${v}')` : `KV('${v}')`)
    }
}
