"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sleet_1 = require("sleet");
const html_entities_1 = require("html-entities");
const util_1 = require("./util");
class TextCompiler extends sleet_1.AbstractCompiler {
    static create(node, stack) {
        if (node.name === '|')
            return new TextCompiler(node, stack);
    }
    compile(ctx) {
        if (!this.node.text.length)
            return;
        const ii = util_1.next(this.stack);
        util_1.put(this.stack, 'TX');
        ctx.eol().indent().push(`const ${ii} = TX(`);
        this.node.text.filter(it => !!it.length).forEach(line => {
            line.forEach(item => {
                ctx.compileUp(item, this.stack);
                ctx.push(', ');
            });
            ctx.pop().push(`, '\\n'`);
        });
        ctx.pop().push(')');
        return ii;
    }
}
TextCompiler.type = sleet_1.NodeType.Tag;
exports.TextCompiler = TextCompiler;
class StaticTextCompiler extends sleet_1.AbstractCompiler {
    static create(node, stack) {
        return new StaticTextCompiler(node, stack);
    }
    compile(context) {
        context.push(`'${html_entities_1.Html5Entities.decode(this.node.toHTMLString())}'`);
    }
}
StaticTextCompiler.type = sleet_1.NodeType.StaticText;
exports.StaticTextCompiler = StaticTextCompiler;
class DynamicTextCompiler extends sleet_1.AbstractCompiler {
    static create(node, stack) {
        return new DynamicTextCompiler(node, stack);
    }
    compile(context) {
        const i = this.node.value.type === sleet_1.NodeType.IdentifierValue;
        if (i) {
            util_1.put(this.stack, 'H');
            context.push('H(');
        }
        context.compileUp(this.node.value, this.stack);
        if (i)
            context.push(')');
    }
}
DynamicTextCompiler.type = sleet_1.NodeType.DynamicText;
exports.DynamicTextCompiler = DynamicTextCompiler;
