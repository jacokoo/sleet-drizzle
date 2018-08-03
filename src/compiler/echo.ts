import { Compiler } from './compiler'

const valueIt = (value: Sleet.Value, ignoreHeler) => {
    if (value.minor === 'number' || value.minor === 'boolean') return `SV(${value.value})`
    if (value.minor === 'identifier') return `DV('${value.value}')`
    if (value.minor === 'quoted') return `SV('${value.value}')`
    if (ignoreHeler) return ''

    const vv = value as Sleet.Helper
    const vs = vv.attributes.map(it => valueIt(it.value[0], true))
    return `HH('${vv.name}', ${vs.join(', ')})`
}

const connect = (vs: Sleet.Value[]) => {
    if (vs.length === 1) return `H(${valueIt(vs[0], true)})`
    return `HH('concat', ${vs.map(it => valueIt(it, true)).join(', ')})`
}

export class EchoCompiler extends Compiler {
    doCompile () {
        this.context.factory('H', 'HH', 'DV', 'SV', 'TN')
        const vs = this.tag.attributes.map(it => it.value).reduce((acc, it) => acc.concat(it))

        const hs = []
        let avs = []

        vs.forEach(it => {
            if (it.minor === 'helper') {
                if (avs.length) hs.push(connect(avs))
                avs = []
                hs.push(valueIt(it, false))
                return
            }
            avs.push(it)
        })
        if (avs.length) hs.push(connect(avs))

        this.context.init(`const ${this.id} = TN(${hs.join(', ')})`)
    }
}
