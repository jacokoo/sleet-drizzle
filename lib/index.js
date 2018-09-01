"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sleet_1 = require("sleet");
const tag_1 = require("./compilers/tag");
const template_1 = require("./compilers/template");
const value_1 = require("./compilers/value");
const script_1 = require("./compilers/script");
const helper_1 = require("./compilers/helper");
const attribute_1 = require("./compilers/attribute");
const text_1 = require("./compilers/text");
exports.plugin = {
    prepare(context) {
        context.register(tag_1.NormalTagCompiler, tag_1.CommentCompiler, template_1.ModuleCompiler, template_1.ViewCompiler, script_1.ScriptCompiler);
        context.register(value_1.QuotedStringCompiler, value_1.NumberValueCompiler, value_1.BooleanValueCompiler);
        context.register(value_1.NullValueCompiler, value_1.IdentifierValueCompiler, value_1.CompareOperatorValueCompiler);
        context.register(value_1.TransformerCompiler, value_1.TransformValueCompiler);
        context.register(helper_1.HelperAttributeCompiler, helper_1.HelperCompiler);
        context.register(attribute_1.AttributeCompilerFactory);
        context.register(text_1.TextCompiler, text_1.StaticTextCompiler, text_1.DynamicTextCompiler);
    },
    compile(input, options, context) {
        const nodes = input.nodes.filter(it => it.name !== '#');
        if (!nodes.length) {
            return { code: '', extension: 'js' };
        }
        if (nodes.length > 2) {
            throw new Error('only two root elements are allowed: 1. module/view 2. script');
        }
        if (nodes[0].name !== 'module' && nodes[0].name !== 'view') {
            throw new Error('the first root element should be module/view');
        }
        if (nodes.length > 1 && nodes[1].name !== 'script') {
            throw new Error('the second root element should be script');
        }
        const note = {
            factories: [],
            counter: { count: 0 },
            references: [],
            imports: [],
            isModule: nodes[0].name === 'module'
        };
        const stack = new sleet_1.SleetStack([], note);
        let script;
        if (nodes[1]) {
            script = context.compile(nodes[1], stack, -1);
        }
        const sub = context.compile(nodes[0], stack, -1);
        note.imports.forEach(it => context.eol().push(it));
        context.eol().push(`import { factory } from 'drizzlejs'`);
        context.eol().push(`const { ${note.factories.join(', ')} } = factory`);
        context.eol().eol();
        sub.mergeUp();
        if (script)
            script.mergeUp();
        return {
            code: context.getOutput(),
            extension: 'js'
        };
    }
};
