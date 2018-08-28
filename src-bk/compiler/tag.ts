import { Compiler } from './compiler'

export class TagCompiler extends Compiler {
    statics: string[] = []
    inits: string[] = []
    type = 'SN'

    doCompile () {
        this.tag.attributes.forEach(it => this.doAttribute(it))

        const id = this.tag.id ? `'${this.tag.id}'` : null
        const na = this.tag.name
        const st = this.statics.join(', ')
        this.context.factory(this.type, 'C')

        let str = `const ${this.id} = ${this.type}('${na}'`
        if (id) str += `, ${id}`

        if (this.statics.length) {
            if (!id) str += `, null`
            str  += ', ' + st
        }
        this.context.init(`${str})`)
        this.inits.forEach(it => this.context.init(it))

        super.doCompile()
    }

    doAttribute (attr: Sleet.Attribute): void {
        if (attr.namespace) {
            if (attr.namespace === 'on') return this.doEvent(attr)
            if (attr.namespace === 'action') return this.doAction(attr)
            if (attr.namespace === 'bind') return this.doBind(attr)
            if (attr.namespace === 'comp') return this.doComponent(attr)
            throw new SyntaxError(`attribute namespace ${attr.namespace} is not supported`)
        }

        if (attr.value.some(it => it.minor === 'identifier' || it.minor === 'helper')) {
            return this.doDynamic(attr)
        }

        if (attr.value.length === 1 && attr.value[0].minor === 'identifier'
            && (attr.value[0].value as string).slice(0, 5) === 'bind:') {
                this.inits.push(`${this.f('BD')}(${this.id}, '${attr.value[0].value}', '${attr.value[0].value}')`)
                return
        }

        return this.doStatic(attr)
    }

    doEvent (attr: Sleet.Attribute) {
        this.type = 'DN'
        this.inits.push(`${this.f('EV')}${this.eventString(attr)}`)
    }

    doAction (attr: Sleet.Attribute) {
        this.type = 'DN'
        this.inits.push(`${this.f('AC')}${this.eventString(attr)}`)
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

            return `(${this.id}, '${attr.name}', '${name}', ${vs})`
        }

        return `(${this.id}, '${attr.name}', '${v.value}')`
    }

    doBind (attr: Sleet.Attribute) {
        this.type = 'DN'
        this.inits.push(`${this.f('BD')}(${this.id}, '${attr.name}', '${attr.value[0].value}')`)
    }

    doDynamic (attr: Sleet.Attribute) {
        this.inits.push(`${this.f('DA')}(${this.id}, ${this.attributeToHelpers(attr)})`)
    }

    doComponent (attr: Sleet.Attribute) {
        this.inits.push(`${this.f('CO')}(${this.id}, ${this.attributeToHelpers(attr)})`)
    }

    attributeToHelpers (attr: Sleet.Attribute) {
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

        return `'${name}', ${helpers.join(', ')}`
    }

    doStatic (attr: Sleet.Attribute) {
        const vs = attr.value.map(it => it.value + '')
        const v = attr.name === 'class' ? vs.join(' ') : vs.join('')
        this.context.factory('KV')
        this.statics.push(attr.name ? `KV('${attr.name}', '${v}')` : `KV('${v}')`)
    }
}
