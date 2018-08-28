import { SleetPlugin, Context, CompileResult, SleetOptions, SleetOutput } from 'sleet'

export const plugin = {
    prepare (context: Context) {

    },

    compile (input: CompileResult, options: SleetOptions, context: Context): SleetOutput {
        return {
            code: '',
            extension: 'js'
        }
    }
} as SleetPlugin
