import { AbstractCompiler, Tag, Context, Attribute, StringValue, AttributeGroup } from 'sleet'
import { next, put } from './tag-factory'

export class NormalTagCompiler extends AbstractCompiler<Tag> {
    compile (ctx: Context) {
        const id = next(this.stack)

        const last = this.stack.last()!
        const subs = this.mergeGroup().attributes.map(it => ctx.compile(it, this.stack, -1))
        const name = last.note.isDynamic ? 'DN' : 'SN'
        put(this.stack, name)
        ctx.push(`const ${id} = ${name}('${this.node.name}'`)
        if (this.node.hash) ctx.push(`, '${this.node.hash}'`)
        ctx.push(')')
        subs.forEach(it => it.mergeUp())
    }

    mergeGroup (): AttributeGroup {
        if (this.node.dots) {
            const location = {
                start: {line: 0, column: 0, offset: 0},
                end: {line: 0, column: 0, offset: 0}
            }
            const vs = this.node.dots.map(it => new StringValue(it, location))
            const group = new AttributeGroup([new Attribute(null, 'class', vs, location)], null, location)
            if (this.node.attributeGroups.length) group.merge(this.node.attributeGroups[0])
            return group
        }

        return this.node.attributeGroups[0]
    }
}
