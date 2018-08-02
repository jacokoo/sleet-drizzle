import { Compiler } from './compiler'
import * as acorn from 'acorn'
import * as walk from 'acorn/dist/walk'
import * as codegen from 'escodegen'

export class ScriptCompiler extends Compiler {
    initChildren () {}

    doCompile () {
        const source = this.tag.sleet.text.join('\n')
        const result = acorn.parse(source, {sourceType: 'module'})
        const b = result.body.find(it => it.type === 'ExportDefaultDeclaration')
        b.declaration.properties.push({
            type: 'Property',
            shorthand: true,
            key: {
                type: 'Identifier',
                name: 'abc'
            },
            value: {
                type: 'Identifier',
                name: 'abc'
            }
        })
        console.log(result.body.length)
        console.log(codegen.generate(b))
    }
}
