"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sleet_1 = require("sleet");
const util_1 = require("./util");
class HelperAttributeCompiler extends sleet_1.AbstractCompiler {
    constructor(node, stack, ignoreName) {
        super(node, stack);
        this.ignoreName = ignoreName;
    }
    static create(node, stack) {
        const ignore = stack.last().node.type !== sleet_1.NodeType.Attribute;
        return new HelperAttributeCompiler(node, stack, ignore);
    }
    compile(ctx) {
        if (this.ignoreName) {
            ctx.compileUp(this.node.value, this.stack);
            return;
        }
        util_1.put(this.stack, 'AT');
        ctx.push(`AT('${this.node.name || ''}', `);
        ctx.compileUp(this.node.value, this.stack);
        ctx.push(')');
    }
}
HelperAttributeCompiler.type = sleet_1.NodeType.HelperAttribute;
exports.HelperAttributeCompiler = HelperAttributeCompiler;
class HelperCompiler extends sleet_1.AbstractCompiler {
    static create(node, stack) {
        return new HelperCompiler(node, stack);
    }
    compile(ctx) {
        if (this.node.name) {
            util_1.put(this.stack, 'HH');
            ctx.push(`HH('${this.node.name}'`);
            this.node.attributes.forEach(it => {
                ctx.push(', ');
                ctx.compileUp(it, this.stack);
            });
            ctx.push(')');
            return;
        }
        this.node.attributes.forEach((it, idx) => {
            if (idx)
                ctx.push(', ');
            util_1.put(this.stack, 'H');
            ctx.push('H(');
            ctx.compileUp(it, this.stack);
            ctx.push(')');
        });
    }
}
HelperCompiler.type = sleet_1.NodeType.Helper;
exports.HelperCompiler = HelperCompiler;
