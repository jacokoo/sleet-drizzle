"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sleet_1 = require("sleet");
class TagCompiler extends sleet_1.AbstractCompiler {
    static create(node, stack) {
        return;
    }
    compile(ctx) {
    }
}
TagCompiler.type = sleet_1.NodeType.Tag;
exports.TagCompiler = TagCompiler;
