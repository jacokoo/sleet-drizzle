"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sleet_1 = require("sleet");
const util_1 = require("./util");
class QuotedStringCompiler extends sleet_1.AbstractCompiler {
    static create(node, stack) {
        return new QuotedStringCompiler(node, stack);
    }
    compile(ctx) {
        util_1.put(this.stack, 'SV');
        ctx.push(`SV('${this.node.value}')`);
    }
}
QuotedStringCompiler.type = sleet_1.NodeType.StringValue;
exports.QuotedStringCompiler = QuotedStringCompiler;
class NumberValueCompiler extends sleet_1.AbstractCompiler {
    static create(node, stack) {
        return new NumberValueCompiler(node, stack);
    }
    compile(ctx) {
        util_1.put(this.stack, 'SV');
        ctx.push(`SV(${this.node.value})`);
    }
}
NumberValueCompiler.type = sleet_1.NodeType.NumberValue;
exports.NumberValueCompiler = NumberValueCompiler;
class BooleanValueCompiler extends sleet_1.AbstractCompiler {
    static create(node, stack) {
        return new BooleanValueCompiler(node, stack);
    }
    compile(ctx) {
        util_1.put(this.stack, 'SV');
        ctx.push(`SV(${this.node.value})`);
    }
}
BooleanValueCompiler.type = sleet_1.NodeType.BooleanValue;
exports.BooleanValueCompiler = BooleanValueCompiler;
class NullValueCompiler extends sleet_1.AbstractCompiler {
    static create(node, stack) {
        return new NullValueCompiler(node, stack);
    }
    compile(ctx) {
        util_1.put(this.stack, 'SV');
        ctx.push(`SV(null)`);
    }
}
NullValueCompiler.type = sleet_1.NodeType.NullValue;
exports.NullValueCompiler = NullValueCompiler;
class IdentifierValueCompiler extends sleet_1.AbstractCompiler {
    static create(node, stack) {
        return new IdentifierValueCompiler(node, stack);
    }
    compile(ctx) {
        util_1.put(this.stack, 'DV');
        ctx.push(`DV('${this.node.value}')`);
    }
}
IdentifierValueCompiler.type = sleet_1.NodeType.IdentifierValue;
exports.IdentifierValueCompiler = IdentifierValueCompiler;
class CompareOperatorValueCompiler extends sleet_1.AbstractCompiler {
    static create(node, stack) {
        return new CompareOperatorValueCompiler(node, stack);
    }
    compile(ctx) {
        util_1.put(this.stack, 'SV');
        ctx.push(`SV('${this.node.value}')`);
    }
}
CompareOperatorValueCompiler.type = sleet_1.NodeType.CompareOperator;
exports.CompareOperatorValueCompiler = CompareOperatorValueCompiler;
class TransformValueCompiler extends sleet_1.AbstractCompiler {
    static create(node, stack) {
        return new TransformValueCompiler(node, stack);
    }
    compile(ctx) {
        util_1.put(this.stack, 'TV');
        ctx.push(`TV('${this.node.value}'`);
        if (this.node.end) {
            ctx.push(', ');
            ctx.compileUp(this.node.end, this.stack);
        }
        if (!this.node.end && this.node.transformers.length) {
            ctx.push(', null');
        }
        this.node.transformers.forEach(it => {
            ctx.push(', ');
            if (typeof it === 'string') {
                util_1.put(this.stack, 'TI');
                ctx.push(`TI('${it}')`);
                return;
            }
            ctx.compileUp(it, this.stack);
        });
        ctx.push(')');
    }
}
TransformValueCompiler.type = sleet_1.NodeType.TransformValue;
exports.TransformValueCompiler = TransformValueCompiler;
class TransformerCompiler extends sleet_1.AbstractCompiler {
    static create(node, stack) {
        return new TransformerCompiler(node, stack);
    }
    compile(ctx) {
        util_1.put(this.stack, 'TI');
        ctx.push(`TI('${this.node.name}'`);
        this.node.params.forEach(it => {
            ctx.push(', ');
            ctx.compileUp(it, this.stack);
        });
        ctx.push(')');
    }
}
TransformerCompiler.type = sleet_1.NodeType.Transformer;
exports.TransformerCompiler = TransformerCompiler;
