"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sleet_1 = require("sleet");
const extra_tag_1 = require("./extra-tag");
const util_1 = require("./util");
const create = (tag, stack) => {
    const refs = stack.note('references');
    if (tag.name && refs.indexOf(tag.name) !== -1)
        return new ReferenceCompiler(tag, stack);
    return new NormalTagCompiler(tag, stack);
};
class NormalTagCompiler extends sleet_1.AbstractCompiler {
    static create(node, stack) {
        const tag = node;
        if (!tag.extra)
            return create(tag, stack);
        const last = stack.last();
        if (last && last.node === node) {
            return create(tag, stack);
        }
        if (!last || last.node.type !== sleet_1.NodeType.TagExtra) {
            if (tag.extra.name === 'each')
                return new extra_tag_1.EachTagCompiler(tag, stack);
            if (tag.extra.name === 'if')
                return new extra_tag_1.IfTagCompiler(tag, stack);
        }
        if (last && last.node.type === sleet_1.NodeType.TagExtra && tag.extra.name === 'elseif') {
            return new extra_tag_1.IfTagCompiler(tag, stack);
        }
        return create(tag, stack);
    }
    compile(ctx) {
        const ii = util_1.next(this.stack);
        const name = this.nodeType();
        const subs = this.mergeGroup().attributes.map(it => ctx.compile(it, this.stack, -1));
        util_1.put(this.stack, name);
        ctx.eol().indent().push(`const ${ii} = ${name}('${this.node.name || 'div'}'`);
        if (this.node.hash)
            ctx.push(`, '${this.node.hash}'`);
        ctx.push(')');
        subs.forEach(it => {
            if (!it)
                return;
            ctx.eol().indent();
            it.mergeUp();
        });
        const ids = util_1.compileNodes(ctx, this.stack, this.node.children);
        if (ids.length) {
            util_1.put(this.stack, 'C');
            ctx.eol().indent().push(`C(${ii}, ${ids.join(', ')})`);
        }
        return ii;
    }
    nodeType() {
        const last = this.stack.last();
        const name = last.note.isDynamic ? 'DN' : 'SN';
        return name;
    }
    mergeGroup() {
        const location = {
            start: { line: 0, column: 0, offset: 0 },
            end: { line: 0, column: 0, offset: 0 }
        };
        if (this.node.dots.length) {
            const vs = this.node.dots.map(it => new sleet_1.StringValue(it, location));
            const group = new sleet_1.AttributeGroup([new sleet_1.Attribute(undefined, 'class', vs, location)], undefined, location);
            if (this.node.attributeGroups.length)
                group.merge(this.node.attributeGroups[0]);
            return group;
        }
        return this.node.attributeGroups[0] || new sleet_1.AttributeGroup([], undefined, location);
    }
}
NormalTagCompiler.type = sleet_1.NodeType.Tag;
exports.NormalTagCompiler = NormalTagCompiler;
class CommentCompiler extends sleet_1.AbstractCompiler {
    static create(node, stack) {
        if (node.name === '#')
            return new CommentCompiler(node, stack);
    }
    compile() {
    }
}
CommentCompiler.type = sleet_1.NodeType.Tag;
exports.CommentCompiler = CommentCompiler;
class RegionCompiler extends sleet_1.AbstractCompiler {
    static create(node, stack) {
        if (node.name === 'region')
            return new RegionCompiler(node, stack);
    }
    compile(ctx) {
        util_1.put(this.stack, 'RG');
        const ii = util_1.next(this.stack);
        ctx.push(`const ${ii} = RG(${this.node.hash || ''})`);
        return ii;
    }
}
RegionCompiler.type = sleet_1.NodeType.Tag;
exports.RegionCompiler = RegionCompiler;
class ReferenceCompiler extends NormalTagCompiler {
    static create(node, stack) {
        const refs = stack.note('references');
        const tag = node;
        if (tag.name && refs.indexOf(tag.name) !== -1)
            return new ReferenceCompiler(tag, stack);
    }
    nodeType() {
        this.stack.last().note.isReference = true;
        return 'REF';
    }
}
ReferenceCompiler.type = sleet_1.NodeType.Tag;
