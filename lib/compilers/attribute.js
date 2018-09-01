"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sleet_1 = require("sleet");
const util_1 = require("./util");
class AttributeCompilerFactory extends sleet_1.AbstractCompiler {
    static create(node, stack) {
        const attr = node;
        const ref = stack.last(sleet_1.NodeType.Tag).note.isReference;
        if (attr.namespace) {
            if (attr.namespace === 'on')
                return new EventCompiler(attr, stack);
            if (attr.namespace === 'action')
                return new ActionCompiler(attr, stack);
            if (attr.namespace === 'comp' && !ref)
                return new ComponentCompiler(attr, stack);
            if (attr.namespace === 'bind')
                return new BindingCompiler(attr, stack);
        }
        const dynamic = attr.values.some(it => it.type === sleet_1.NodeType.IdentifierValue || it.type === sleet_1.NodeType.Helper);
        if (dynamic) {
            return ref ? new ReferenceDynamicAttributeCompiler(attr, stack) : new DynamicAttributeCompiler(attr, stack);
        }
        return new StaticAttributeCompiler(attr, stack);
    }
    compile() { }
}
AttributeCompilerFactory.type = sleet_1.NodeType.Attribute;
exports.AttributeCompilerFactory = AttributeCompilerFactory;
class ReferenceDynamicAttributeCompiler extends sleet_1.AbstractCompiler {
    compile(ctx) {
        util_1.put(this.stack, 'MP');
        ctx.push(`MP(${util_1.id(this.stack)}`);
        const v = this.node.values[0];
        if (!v || v.type !== sleet_1.NodeType.IdentifierValue) {
        }
        const vv = v.value;
        ctx.push(`, '${vv}'`);
        if (this.node.name)
            ctx.push(`, ${this.node.name}`);
        ctx.push(')');
    }
}
class DynamicAttributeCompiler extends sleet_1.AbstractCompiler {
    compile(ctx) {
        this.stack.last(sleet_1.NodeType.Tag).note.isDynamic = true;
        util_1.put(this.stack, name);
        ctx.push(`DA(${util_1.id(this.stack)}, '${this.node.name || ''}'`);
        this.node.values.forEach(it => {
            ctx.push(', ');
            if (it.type !== sleet_1.NodeType.Helper) {
                util_1.put(this.stack, 'H');
                ctx.push('H(');
            }
            ctx.compileUp(it, this.stack);
            if (it.type !== sleet_1.NodeType.Helper)
                ctx.push(')');
        });
        ctx.push(')');
    }
}
class StaticAttributeCompiler extends sleet_1.AbstractCompiler {
    compile(ctx) {
        util_1.put(this.stack, 'SA');
        ctx.push(`SA(${util_1.id(this.stack)}, '${this.node.name || ''}'`);
        if (this.node.values.length === 1) {
            const v = this.node.values[0];
            if (v instanceof sleet_1.StringValue)
                ctx.push(`, '${v.value}'`);
            else
                ctx.push(`, ${v.value}`);
        }
        else {
            const v = this.node.values.map(it => it.value)
                .join(this.node.name === 'class' ? ' ' : '');
            ctx.push(`, '${v}'`);
        }
        ctx.push(')');
    }
}
class BindingCompiler extends sleet_1.AbstractCompiler {
    compile(ctx) {
        this.stack.last(sleet_1.NodeType.Tag).note.isDynamic = true;
        util_1.put(this.stack, 'BD');
        const v = this.node.values[0];
        if (v && v.type !== sleet_1.NodeType.IdentifierValue) {
        }
        const vv = v ? v.toHTMLString() : this.node.name;
        ctx.push(`BD(${util_1.id(this.stack)}, '${this.node.name}', '${vv}')`);
    }
}
class EventCompiler extends sleet_1.AbstractCompiler {
    constructor() {
        super(...arguments);
        this.name = 'EV';
    }
    compile(ctx) {
        this.stack.last(sleet_1.NodeType.Tag).note.isDynamic = true;
        util_1.put(this.stack, this.name);
        const v = this.node.values[0];
        ctx.push(`${this.name}(${util_1.id(this.stack)}, '${this.node.name}'`);
        if (v.type === sleet_1.NodeType.IdentifierValue) {
            ctx.push(`, '${v.toHTMLString()}')`);
            return;
        }
        if (v.type === sleet_1.NodeType.Helper) {
            const h = v;
            ctx.push(`, '${h.name}'`);
            h.attributes.forEach(it => {
                ctx.push(', ');
                ctx.compileUp(it, this.stack);
            });
            ctx.push(')');
        }
    }
}
class ActionCompiler extends EventCompiler {
    constructor() {
        super(...arguments);
        this.name = 'AC';
    }
}
class ComponentCompiler extends sleet_1.AbstractCompiler {
    compile(ctx) {
        this.stack.last(sleet_1.NodeType.Tag).note.isDynamic = true;
        util_1.put(this.stack, 'CO');
        ctx.push(`CO(${util_1.id(this.stack)}, ${this.node.name}`);
        this.node.values.forEach(it => {
            ctx.push(', ');
            if (it.type !== sleet_1.NodeType.Helper) {
                util_1.put(this.stack, 'H');
                ctx.push('H(');
            }
            ctx.compileUp(it, this.stack);
            if (it.type !== sleet_1.NodeType.Helper)
                ctx.push(')');
        });
        ctx.push(')');
    }
}
