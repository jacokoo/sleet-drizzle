import { Context } from './context'
import { DrizzleTag } from './tag'

export function overrideContext (
    context: Sleet.Context,
    options: Sleet.PluginOption & Sleet.CompileOption,
    declaration: Sleet.Declaration
) {

    const ctx = new Context(context)

    context.doCompile = tags => {
        if (tags.length > 2) {
            throw new Error('only two root elements are allowed: 1. module/view 2. script')
        }
        if (tags[0].name !== 'module' && tags[0].name !== 'view') {
            throw new Error('the first root element should be module/view')
        }
        if (tags.length > 1 && tags[1].name !== 'script') {
            throw new Error('the second root element should be script')
        }
        const t = new DrizzleTag(tags[0], null)
        ctx.create(t, null).doCompile()
    }

    context.getOutput = () => {
        return ctx.getOutput()
    }
}
