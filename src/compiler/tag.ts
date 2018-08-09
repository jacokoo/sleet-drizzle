import { Compiler } from './compiler'

export class TagCompiler extends Compiler {
    statics: string[] = []
    dynamics: string[] = []
    binds: string[] = []
    events: string[] = []
    actions: string[] = []
    type = 'SN'

    doCompile () {
        this.tag.attributes.forEach(it => this.doAttribute(it))

        const id = this.tag.id ? `'${this.tag.id}'` : null
        let st = this.statics.join(', ')
        const na = this.tag.name

        this.context.factory(this.type, 'C')
        if (this.type === 'SN') {
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

        super.doCompile()
    }

    doAttribute (attr: Sleet.Attribute): void {
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
                return
        }

        return this.doStatic(attr)
    }

    doEvent (attr: Sleet.Attribute) {
        this.type = 'DN'
        this.context.factory('E')
        this.events.push(`E${this.eventString(attr)}`)
    }

    doAction (attr: Sleet.Attribute) {
        this.type = 'DN'
        this.context.factory('A')
        this.actions.push(`A${this.eventString(attr)}`)
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

        return `('${attr.name}', '${v.value}')`
    }

    doBind (attr: Sleet.Attribute) {
        this.type = 'DN'
        this.context.factory('B')
        this.binds.push(`B('${attr.name}', '${attr.value[0].value}')`)
    }

    doDynamic (attr: Sleet.Attribute) {
        this.type = 'DN'
        const {name, value} = attr
        const helpers = []

        let sts = []
        value.forEach(it => {
            if (it.minor === 'identifier') {
                this.context.factory('H', 'SV')
                if (sts.length) {
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

        this.context.factory('DA')
        this.dynamics.push(`DA('${name}', ${helpers.join(', ')})`)
    }

    doStatic (attr: Sleet.Attribute) {
        const vs = attr.value.map(it => it.value + '')
        const v = attr.name === 'class' ? vs.join(' ') : vs.join('')
        this.context.factory('KV')
        this.statics.push(attr.name ? `KV('${attr.name}', '${v}')` : `KV('${v}')`)
    }
}
