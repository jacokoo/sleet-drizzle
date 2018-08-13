import { Compiler } from './compiler'

function valueIt (this: Compiler, value: Sleet.Value, ignoreHeler = false) {
    if (value.minor === 'number' || value.minor === 'boolean') return `${this.f('SV')}(${value.value})`
    if (value.minor === 'identifier') return `${this.f('DV')}('${value.value}')`
    if (value.minor === 'quoted') return `${this.f('SV')}('${value.value}')`
    if (ignoreHeler) return ''

    const vv = value as Sleet.Helper
    const vs = vv.attributes.map(it => valueIt.call(this, it.value[0], true))
    return `${this.f('HH')}('${vv.name}', ${vs.join(', ')})`
}

export class EchoCompiler extends Compiler {
    doCompile () {
        const vs = this.tag.attributes.map(it => it.value).reduce((acc, it) => acc.concat(it))

        const hs = vs.map(it => {
            if (it.minor === 'helper') {
                return valueIt.call(this, it)
            }
            if (it.minor === 'identifier') {
                return `${this.f('H')}('${it.value}')`
            }
            return `'${it.value}'`
        })

        this.context.init(`const ${this.id} = ${this.f('TX')}(${hs.join(', ')})`)
    }
}
