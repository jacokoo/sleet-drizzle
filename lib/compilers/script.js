"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sleet_1 = require("sleet");
const acorn_1 = require("acorn");
const escodegen_1 = require("escodegen");
class ScriptCompiler extends sleet_1.AbstractCompiler {
    static create(node, stack) {
        const tag = node;
        if (tag.name === 'script' && tag.indent === 0)
            return new ScriptCompiler(tag, stack);
    }
    compile(context) {
        const body = this.check(context);
        const imports = this.stack.note('imports');
        body.forEach(it => {
            if (it.type.slice(0, 6) === 'Import') {
                imports.push(escodegen_1.generate(it));
                return;
            }
            context.eol().indent().push(escodegen_1.generate(it));
        });
    }
    check(context) {
        const source = this.getContent();
        const { body } = acorn_1.parse(source, { sourceType: 'module', ecmaVersion: 9 });
        if (body.some(it => it.type === 'ExportAllDeclaration' || it.type === 'ExportNamedDeclaration')) {
            throw new SyntaxError('can only export default object');
        }
        const b = body.find(it => it.type === 'ExportDefaultDeclaration');
        if (!b) {
            throw new SyntaxError('must have default export object');
        }
        if (b.declaration.type !== 'ObjectExpression') {
            throw new SyntaxError('must have default export object');
        }
        const { properties } = b.declaration;
        if (this.stack.note('isModule')) {
            const items = properties.find(it => it.key.name === 'items' || it.key.value === 'items');
            const references = this.getReferences(items && items.value);
            if (references.some(it => it.indexOf('-') === -1)) {
                throw new SyntaxError('The key of view or module reference should ' +
                    'have at least one dash(-) char to differentiate from HTML tag');
            }
            const refs = this.stack.note('references');
            references.forEach(it => {
                if (refs.indexOf(it) === -1)
                    refs.push(it);
            });
        }
        b.declaration.properties.push({
            type: 'Property',
            shorthand: true,
            key: { type: 'Identifier', name: 'template' },
            value: { type: 'Identifier', name: 'template' }
        });
        if (context.options.sourceFile) {
            const value = context.options.sourceFile.split('/').slice(-2).join('/');
            b.declaration.properties.push({
                type: 'Property',
                key: { type: 'Identifier', name: '_file' },
                value: { type: 'Literal', value }
            });
        }
        return body;
    }
    getReferences(items) {
        if (!items)
            return [];
        if (items.type !== 'ObjectExpression') {
            throw new SyntaxError('items should be an object');
        }
        const { properties } = items;
        const keys = ['views', 'modules', 'refs'];
        if (properties.some(it => keys.indexOf(this.getPropertyKey(it)) === -1)) {
            throw new SyntaxError('the keys of items should be [views, modules, refs]');
        }
        let result = [];
        properties.forEach(it => {
            const name = this.getPropertyKey(it);
            if (name === 'views' || name === 'refs') {
                if (it.value.type !== 'ArrayExpression') {
                    throw new SyntaxError(`${name} should be an array`);
                }
                result = result.concat(this.getArrayValue(it.value.elements, name));
            }
            else if (name === 'modules') {
                if (it.value.type !== 'ObjectExpression') {
                    throw new SyntaxError(`${name} should be an object`);
                }
                result = result.concat(it.value.properties.map(p => this.getPropertyKey(p)));
            }
        });
        return result;
    }
    getArrayValue(arr, name) {
        return arr.map(it => {
            if (it.type !== 'Literal' || (typeof it.value !== 'string')) {
                throw new SyntaxError(`array item in ${name} should be string literal`);
            }
            return it.value;
        });
    }
    getPropertyKey(prop) {
        if (prop.key.type === 'Literal')
            return prop.key.value;
        return prop.key.name;
    }
    getContent() {
        return this.node.children.filter(it => it.name === '|').map(it => it.text.map(line => line.map(item => item.toHTMLString()).join('')).join('\n')).join('\n');
    }
}
ScriptCompiler.type = sleet_1.NodeType.Tag;
exports.ScriptCompiler = ScriptCompiler;
