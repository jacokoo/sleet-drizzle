"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tag_1 = require("./compilers/tag");
exports.plugin = {
    prepare(context) {
        context.register(tag_1.TagCompiler);
    },
    compile(input, options, context) {
        return {
            code: context.getOutput(),
            extension: 'js'
        };
    }
};
