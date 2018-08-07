import { Compiler } from './compiler'
import {parse} from 'acorn'
import {generate} from 'escodegen'

export class ScriptCompiler extends Compiler {
    references: string[]
    body: any
    initChildren () {
        const source = this.tag.sleet.text.join('\n')
        const {body} = parse(source, {sourceType: 'module', ecmaVersion: 9})
        if (body.some(it => it.type === 'ExportAllDeclaration' || it.type === 'ExportNamedDeclaration')) {
            throw new SyntaxError('can only export default object')
        }
        const b = body.find(it => it.type === 'ExportDefaultDeclaration')
        if (!b) {
            throw new SyntaxError('must have default export object')
        }
        if (b.declaration.type !== 'ObjectExpression') {
            throw new SyntaxError('must have default export object')
        }

        const {properties} = b.declaration
        const items = properties.find(it => it.key.name === 'items')
        this.references = this.getReferences(items && items.value)
        if (this.references.some(it => it.indexOf('-') === -1)) {
            throw new SyntaxError('The key of view or module reference should ' +
                'have at least one dash(-) char to differentiate from HTML tag')
        }

        b.declaration.properties.push({
            type: 'Property',
            shorthand: true,
            key: { type: 'Identifier', name: 'template' },
            value: { type: 'Identifier', name: 'template' }
        })

        this.body = body
    }

    doCompile () {
        this.body.forEach(it => {
            if (it.type.slice(0, 6) === 'Import') {
                this.context.start(generate(it))
                return
            }
            if (it.type === 'ExportDefaultDeclaration') {
                this.context.connect('')
                this.context.connect(generate(it))
                return
            }

            this.context.init(generate(it))
        })
    }

    getReferences (items): string[] {
        if (!items) return []
        if (items.type !== 'ObjectExpression') {
            throw new SyntaxError('items should be an object')
        }

        const {properties} = items
        const keys = ['views', 'modules', 'refs']
        if (properties.some(it => keys.indexOf(this.getPropertyKey(it)) === -1)) {
            throw new SyntaxError('the keys of items should be [views, modules, refs]')
        }

        let result: string[] = []

        properties.forEach(it => {
            const name = this.getPropertyKey(it)
            if (name === 'views' || name === 'refs') {
                if (it.value.type !== 'ArrayExpression') {
                    throw new SyntaxError(`${name} should be an array`)
                }
                result = result.concat(this.getArrayValue(it.value.elements, name))
            } else if (name === 'modules') {
                if (it.value.type !== 'ObjectExpression') {
                    throw new SyntaxError(`${name} should be an object`)
                }
                result = result.concat(it.value.properties.map(p => this.getPropertyKey(p)))
            }
        })

        return result
    }

    getArrayValue (arr, name): string[] {
        return arr.map(it => {
            if (it.type !== 'Literal' || (typeof it.value !== 'string')) {
                throw new SyntaxError(`array item in ${name} should be string literal`)
            }
            return it.value
        })
    }

    getPropertyKey (prop): string {
        if (prop.key.type === 'Literal') return prop.key.value
        return prop.key.name
    }
}
