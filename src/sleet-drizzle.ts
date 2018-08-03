import { Context } from './context'
import { DrizzleTag } from './tag'
import { ScriptCompiler } from './script'

export function overrideContext (
    context: Sleet.Context,
    options: Sleet.PluginOption & Sleet.CompileOption,
    declaration: Sleet.Declaration
) {

    const ctx = new Context(context)

    context.doCompile = ts => {
        const tags = ts.filter(it => it.name !== '#')
        if (tags.length > 2) {
            throw new Error('only two root elements are allowed: 1. module/view 2. script')
        }
        if (tags[0].name !== 'module' && tags[0].name !== 'view') {
            throw new Error('the first root element should be module/view')
        }
        if (tags.length > 1 && tags[1].name !== 'script') {
            throw new Error('the second root element should be script')
        }

        const script = new ScriptCompiler(ctx, new DrizzleTag(tags[1], null), null)
        ctx.isView = tags[0].name === 'view'
        if (!ctx.isView) {
            ctx.references = script.references
        }
        const t = new DrizzleTag(tags[0], null)
        ctx.create(t, null).doCompile()
        script.doCompile()
    }

    context.getOutput = () => {
        return ctx.getOutput()
    }
}
