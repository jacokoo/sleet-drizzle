import { Context, CompileResult, SleetOptions, SleetOutput, SleetPlugin, SleetStack } from 'sleet'
import { TagCompiler } from './compilers/tag'
import { IdGenerator, Unique, Container, UniqueContainer } from './util'

export const plugin = {
    prepare (context: Context) {
        context.register(TagCompiler)
    },

    compile (input: CompileResult, options: SleetOptions, context: Context): SleetOutput {
        const nodes = input.nodes.filter(it => it.name !== '#')
        if (!nodes.length) {
            return {code: '', extension: 'js'}
        }

        if (nodes.length > 2) {
            throw new Error('only two root elements are allowed: 1. component/view 2. script')
        }
        if (nodes[0].name !== 'component' && nodes[0].name !== 'view') {
            throw new Error('the first root element should be component/view')
        }
        if (nodes.length > 1 && nodes[1].name !== 'script') {
            throw new Error('the second root element should be script')
        }

        const idg = new IdGenerator()
        const factory = new Unique()
        const helper = new UniqueContainer(idg)
        const event = new UniqueContainer(idg)
        const widget = new Container(idg)
        const binding = new Container(idg)
        const tag = new Unique()

        const note = {
            idg, factory, helper, event, widget, binding, tag,
            references: [],
            import: new Unique(),
            isComponent: nodes[0].name === 'component'
        }

        const stack = new SleetStack([], note)
        const sub = context.compile(nodes[0], stack, -1)
        if (sub) sub.mergeUp()

        return {
            code: context.getOutput(),
            extension: 'js'
        }
    }
} as SleetPlugin
