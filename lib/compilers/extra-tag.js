"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sleet_1 = require("sleet");
const util_1 = require("./util");
class EachTagCompiler extends sleet_1.AbstractCompiler {
    compile(context, elseBlock) {
        const stack = this.stack.concat(this.node.extra);
        const ii = util_1.next(this.stack);
        const compiler = context.create(this.node, stack);
        const sub = context.sub();
        const tid = compiler.compile(sub);
        context.eol().indent().push(`const ${ii} = () => {`);
        sub.mergeUp();
        context.eol().indent(1).push(`return ${tid}`);
        context.eol().indent().push(`}`);
        let fid = '';
        if (elseBlock) {
            const c = context.create(elseBlock, stack);
            const s = context.sub(-1);
            fid = c.compile(s);
            s.mergeUp();
            fid = `, ${fid}`;
        }
        util_1.put(stack, 'EACH');
        context.eol().indent();
        const iid = util_1.next(stack);
        context.push(`const ${iid} = EACH([`);
        context.push(this.node.extra.values.map(it => `'${it.toHTMLString()}'`).join(', '));
        context.push('], ', ii, fid, ')');
        return iid;
    }
}
exports.EachTagCompiler = EachTagCompiler;
class IfTagCompiler extends sleet_1.AbstractCompiler {
    compile(ctx, ...elseBlocks) {
        const stack = this.stack.concat(this.node.extra);
        let eid = '';
        if (elseBlocks.length) {
            const compiler = ctx.create(elseBlocks[0], stack);
            const sub = ctx.sub(-1);
            eid = compiler.compile(sub, ...elseBlocks.slice(1));
            sub.mergeUp();
            eid = `, ${eid}`;
        }
        const s = ctx.sub(-1);
        const c = ctx.create(this.node, this.stack);
        const tid = c.compile(s);
        s.mergeUp();
        util_1.put(stack, 'IF');
        const ii = util_1.next(this.stack);
        ctx.eol().indent().push(`const ${ii} = IF([`);
        this.node.extra.values.forEach((it, idx) => {
            ctx.compileUp(it, stack);
            ctx.push(', ');
        });
        ctx.pop();
        ctx.push(`], ${tid}${eid})`);
        return ii;
    }
}
exports.IfTagCompiler = IfTagCompiler;
