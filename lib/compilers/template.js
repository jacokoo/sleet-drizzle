"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sleet_1 = require("sleet");
const util_1 = require("./util");
class RootCompiler extends sleet_1.AbstractCompiler {
    constructor(node, stack) {
        super(node, stack);
    }
    compile(ctx) {
        const imports = this.stack.note('imports');
        imports.push(`import { ${this.name} } from 'drizzlejs'`);
        ctx.eol().indent().push(`const template = new ${this.name}(${this.params()})`);
        ctx.eol().indent().push(`const templateNodes = () => {`);
        const sub = ctx.sub();
        const ids = util_1.compileNodes(sub, this.stack, this.node.children);
        sub.mergeUp();
        ctx.eol().indent(1).push(`return [${ids.join(', ')}]`);
        ctx.eol().indent().push('}');
        ctx.eol().indent().push('template.creator = templateNodes');
        ctx.eol();
    }
    params() {
        return '';
    }
    attributes() {
        return this.node.attributeGroups.map(it => it.attributes.map(a => a.values.map(v => v.toHTMLString()).join(''))).reduce((acc, item) => {
            return acc.concat(item);
        }, []);
    }
}
RootCompiler.type = sleet_1.NodeType.Tag;
class ModuleCompiler extends RootCompiler {
    constructor() {
        super(...arguments);
        this.name = 'ModuleTemplate';
    }
    static create(node, stack) {
        const tag = node;
        if (tag.indent !== 0)
            return;
        if (tag.name === 'module')
            return new ModuleCompiler(tag, stack);
    }
    params() {
        return `[${this.attributes().map(it => `'${it}'`)}]`;
    }
}
exports.ModuleCompiler = ModuleCompiler;
class ViewCompiler extends RootCompiler {
    constructor() {
        super(...arguments);
        this.name = 'ViewTemplate';
    }
    static create(node, stack) {
        const tag = node;
        if (tag.indent !== 0)
            return;
        if (tag.name === 'view')
            return new ViewCompiler(tag, stack);
    }
    compile(ctx) {
        const refs = this.stack.note('references');
        this.attributes().forEach(it => {
            if (refs.indexOf(it) === -1)
                refs.push(it);
        });
        super.compile(ctx);
    }
}
exports.ViewCompiler = ViewCompiler;
