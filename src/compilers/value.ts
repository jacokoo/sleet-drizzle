import {
    Compiler, AbstractCompiler, StringValue, Context, NodeType,
    SleetNode, SleetStack, NumberValue, BooleanValue, NullValue,
    IdentifierValue, CompareOperatorValue, TransformValue, Transformer
} from 'sleet'
import { put } from './util'

export class QuotedStringCompiler extends AbstractCompiler<StringValue> {
    static type = NodeType.StringValue
    static create (node: SleetNode, stack: SleetStack): Compiler | undefined {
        return new QuotedStringCompiler(node as StringValue, stack)
    }

    compile (ctx: Context) {
        put(this.stack, 'SV')
        ctx.push(`SV('${this.node.value}')`)
    }
}

export class NumberValueCompiler extends AbstractCompiler<NumberValue> {
    static type = NodeType.NumberValue
    static create (node: SleetNode, stack: SleetStack): Compiler | undefined {
        return new NumberValueCompiler(node as NumberValue, stack)
    }

    compile (ctx: Context) {
        put(this.stack, 'SV')
        ctx.push(`SV(${this.node.value})`)
    }
}

export class BooleanValueCompiler extends AbstractCompiler<BooleanValue> {
    static type = NodeType.BooleanValue
    static create (node: SleetNode, stack: SleetStack): Compiler | undefined {
        return new BooleanValueCompiler(node as BooleanValue, stack)
    }

    compile (ctx: Context) {
        put(this.stack, 'SV')
        ctx.push(`SV(${this.node.value})`)
    }
}

export class NullValueCompiler extends AbstractCompiler<NullValue> {
    static type = NodeType.NullValue
    static create (node: SleetNode, stack: SleetStack): Compiler | undefined {
        return new NullValueCompiler(node as NullValue, stack)
    }

    compile (ctx: Context) {
        put(this.stack, 'SV')
        ctx.push(`SV(null)`)
    }
}

export class IdentifierValueCompiler extends AbstractCompiler<IdentifierValue> {
    static type = NodeType.IdentifierValue
    static create (node: SleetNode, stack: SleetStack): Compiler | undefined {
        return new IdentifierValueCompiler(node as IdentifierValue, stack)
    }

    compile (ctx: Context) {
        put(this.stack, 'DV')
        ctx.push(`DV('${this.node.value}')`)
    }
}

export class CompareOperatorValueCompiler extends AbstractCompiler<CompareOperatorValue> {
    static type = NodeType.CompareOperator
    static create (node: SleetNode, stack: SleetStack): Compiler | undefined {
        return new CompareOperatorValueCompiler(node as CompareOperatorValue, stack)
    }

    compile (ctx: Context) {
        put(this.stack, 'SV')
        ctx.push(`SV('${this.node.value}')`)
    }
}

export class TransformValueCompiler extends AbstractCompiler<TransformValue> {
    static type = NodeType.TransformValue
    static create (node: SleetNode, stack: SleetStack): Compiler | undefined {
        return new TransformValueCompiler(node as TransformValue, stack)
    }

    compile (ctx: Context) {
        put(this.stack, 'TV')
        ctx.push(`TV('${this.node.value}'`)
        if (this.node.end) {
            ctx.push(', ')
            ctx.compileUp(this.node.end, this.stack)
        }

        if (!this.node.end && this.node.transformers.length) {
            ctx.push(', null')
        }
        this.node.transformers.forEach(it => {
            ctx.push(', ')
            if (typeof it === 'string') {
                put(this.stack, 'TI')
                ctx.push(`TI(${it})`)
                return
            }
            ctx.compileUp(it, this.stack)
        })
        ctx.push(')')
    }
}

export class TransformerCompiler extends AbstractCompiler<Transformer> {
    static type = NodeType.Transformer
    static create (node: SleetNode, stack: SleetStack): Compiler | undefined {
        return new TransformerCompiler(node as Transformer, stack)
    }

    compile (ctx: Context) {
        put(this.stack, 'TI')
        ctx.push('TI(').push(this.node.name)
        this.node.params.forEach(it => {
            ctx.push(', ')
            ctx.compileUp(it, this.stack)
        })
        ctx.push(')')
    }
}
