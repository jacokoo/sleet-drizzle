"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function put(stack, name) {
    const o = stack.note('factories');
    if (o.indexOf(name) === -1)
        o.push(name);
}
exports.put = put;
function next(stack) {
    const o = stack.note('counter');
    o.count++;
    return `o${o.count}`;
}
exports.next = next;
function id(stack) {
    const o = stack.note('counter');
    return `o${o.count}`;
}
exports.id = id;
function compileNodes(ctx, stack, tags) {
    let i = 0;
    const ids = [];
    while (i < tags.length) {
        const tag = tags[i];
        let n = tags[i + 1];
        const { start } = tag.location;
        if (!n || !n.extra || (n.extra.name !== 'else' && n.extra.name !== 'elseif')) {
            i++;
            const c = ctx.create(tag, stack);
            const s = ctx.sub(-1);
            ids.push(c.compile(s));
            s.mergeUp();
            continue;
        }
        if (!tag.extra) {
            throw new SyntaxError(`not paired else/elseif, line: ${start.line}, column: ${start.column}`);
        }
        const sub = ctx.sub(-1);
        if (tag.extra.name === 'each') {
            if (n.extra.name !== 'else') {
                throw new SyntaxError(`each can not have elseif block, line: ${start.line}, column: ${start.column}`);
            }
            const compiler = ctx.create(tag, stack);
            ids.push(compiler.compile(sub, n));
            sub.mergeUp();
            i += 2;
            continue;
        }
        const blocks = [];
        i++;
        while (n && n.extra && n.extra.name === 'elseif') {
            blocks.push(n);
            i++;
            n = tags[i];
        }
        if (n && n.extra && n.extra.name === 'else') {
            blocks.push(n);
            i++;
        }
        const cc = ctx.create(tag, stack);
        ids.push(cc.compile(sub, ...blocks));
        sub.mergeUp();
    }
    return ids.filter(it => !!it);
}
exports.compileNodes = compileNodes;
