import { SleetStack, Context, Tag } from 'sleet'

export function put (stack: SleetStack, name: string) {
    const o = stack.note('factories') as string[]
    if (o.indexOf(name) === -1) o.push(name)
}

export function next (stack: SleetStack) {
    const o = stack.note('counter') as {count: number}
    o.count ++
    return `o${o.count}`
}

export function id (stack: SleetStack) {
    const o = stack.note('counter') as {count: number}
    return `o${o.count}`
}

export function compileNodes (ctx: Context, stack: SleetStack, tags: Tag[]): string[] {
    let i = 0
    const ids: string[] = []

    while (i < tags.length) {
        const tag = tags[i]
        let n = tags[i + 1]
        const { start } = tag.location

        if (!n || !n.extra || (n.extra.name !== 'else' && n.extra.name !== 'elseif')) {
            i ++
            const c = ctx.create(tag, stack)!
            const s = ctx.sub(-1)
            ids.push(c.compile(s))
            s.mergeUp()
            continue
        }

        if (!tag.extra) {
            throw new SyntaxError(`not paired else/elseif, line: ${start.line}, column: ${start.column}`)
        }

        const sub = ctx.sub(-1)
        if (tag.extra.name === 'each') {
            if (n.extra.name !== 'else') {
                throw new SyntaxError(`each can not have elseif block, line: ${start.line}, column: ${start.column}`)
            }

            const compiler = ctx.create(tag, stack)
            ids.push(compiler!.compile(sub, n))
            sub.mergeUp()
            i += 2
            continue
        }

        const blocks = [] as Tag[]
        i ++
        while (n && n.extra && n.extra.name === 'elseif') {
            blocks.push(n)
            i ++
            n = tags[i]
        }

        if (n && n.extra && n.extra.name === 'else') {
            blocks.push(n)
            i ++
        }
        const cc = ctx.create(tag, stack)!
        ids.push(cc.compile(sub, ...blocks))
        sub.mergeUp()
    }

    return ids.filter(it => !!it)
}
