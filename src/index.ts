import { SleetPlugin, Context, CompileResult, SleetOptions, SleetOutput, SleetStack } from 'sleet'
import { compileNodes } from './compilers/tag-factory'

export const plugin = {
    prepare (context: Context) {
    },

    compile (input: CompileResult, options: SleetOptions, context: Context): SleetOutput {
        const { nodes } = input

        const stack = new SleetStack([], {
            factories: [],
            counter: { count: 0 }
        })

        compileNodes(context, stack, nodes)

        return {
            code: '',
            extension: 'js'
        }
    }
} as SleetPlugin
