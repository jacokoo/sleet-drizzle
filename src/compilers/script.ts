import { AbstractCompiler, Tag, NodeType, SleetNode, SleetStack, Compiler, Context } from 'sleet'
import {parse} from 'acorn'
import {generate} from 'escodegen'

export class ScriptCompiler extends AbstractCompiler<Tag> {
    static type = NodeType.Tag
    static create (node: SleetNode, stack: SleetStack): Compiler | undefined {
        const tag = node as Tag
        if (tag.name === 'script' && tag.indent === 0) return new ScriptCompiler(tag, stack)
    }

    compile (context: Context) {
        const body = this.check()
        const imports = this.stack.note('imports') as string[]
        body.forEach(it => {
            if (it.type.slice(0, 6) === 'Import') {
                imports.push(generate(it))
                return
            }
            context.eol().indent().push(generate(it))
        })
    }

    check () {
        const source = this.getContent()
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
        if (this.stack.note('isModule')) {
            const items = properties.find(it => it.key.name === 'items' || it.key.value === 'items')
            const references = this.getReferences(items && items.value)
            if (references.some(it => it.indexOf('-') === -1)) {
                throw new SyntaxError('The key of view or module reference should ' +
                    'have at least one dash(-) char to differentiate from HTML tag')
            }

            const refs = this.stack.note('references') as string[]
            references.forEach(it => {
                if (refs.indexOf(it) === -1) refs.push(it)
            })
        }

        b.declaration.properties.push({
            type: 'Property',
            shorthand: true,
            key: { type: 'Identifier', name: 'template' },
            value: { type: 'Identifier', name: 'template' }
        })

        return body
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

    getContent () {
        return this.node.children.filter(it => it.name === '|').map(it => it.text.map(line =>
            line.map(item => item.toHTMLString()).join('')).join('\n')).join('\n')
    }
}
