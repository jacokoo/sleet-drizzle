import { SleetPlugin, Context, CompileResult, SleetOptions, SleetOutput, SleetStack } from 'sleet'
import { NormalTagCompiler, CommentCompiler } from './compilers/tag'
import { ModuleCompiler, ViewCompiler } from './compilers/template'
import {
    QuotedStringCompiler, NumberValueCompiler, BooleanValueCompiler,
    NullValueCompiler, IdentifierValueCompiler, CompareOperatorValueCompiler,
    TransformerCompiler, TransformValueCompiler
} from './compilers/value'
import { ScriptCompiler } from './compilers/script'
import { HelperAttributeCompiler, HelperCompiler } from './compilers/helper'
import { AttributeCompilerFactory } from './compilers/attribute'
import { TextCompiler, StaticTextCompiler, DynamicTextCompiler } from './compilers/text'

export const plugin = {
    prepare (context: Context) {
        context.register(NormalTagCompiler, CommentCompiler, ModuleCompiler, ViewCompiler, ScriptCompiler)
        context.register(QuotedStringCompiler, NumberValueCompiler, BooleanValueCompiler)
        context.register(NullValueCompiler, IdentifierValueCompiler, CompareOperatorValueCompiler)
        context.register(TransformerCompiler, TransformValueCompiler)
        context.register(HelperAttributeCompiler, HelperCompiler)
        context.register(AttributeCompilerFactory)
        context.register(TextCompiler, StaticTextCompiler, DynamicTextCompiler)
    },

    compile (input: CompileResult, options: SleetOptions, context: Context): SleetOutput {
        const nodes = input.nodes.filter(it => it.name !== '#')
        if (!nodes.length) {
            return {code: '', extension: 'js'}
        }

        if (nodes.length > 2) {
            throw new Error('only two root elements are allowed: 1. module/view 2. script')
        }
        if (nodes[0].name !== 'module' && nodes[0].name !== 'view') {
            throw new Error('the first root element should be module/view')
        }
        if (nodes.length > 1 && nodes[1].name !== 'script') {
            throw new Error('the second root element should be script')
        }

        const note = {
            factories: [],
            counter: { count: 0 },
            references: [],
            imports: [],
            isModule: nodes[0].name === 'module'
        }
        const stack = new SleetStack([], note)
        const sub = context.compile(nodes[0], stack, -1)
        let script
        if (nodes[1]) {
            script = context.compile(nodes[1], stack, -1)
        }

        note.imports.forEach(it => context.eol().push(it))
        context.eol().push(`import { factory } from 'drizzlejs'`)
        context.eol().push(`const { ${note.factories.join(', ')} } = factory`)
        context.eol().eol()
        sub.mergeUp()
        if (script) script.mergeUp()

        return {
            code: context.getOutput(),
            extension: 'js'
        }
    }
} as SleetPlugin
