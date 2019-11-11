import { AbstractCompiler, Tag, NodeType, SleetNode, SleetStack, Compiler, Context } from 'sleet'

export abstract class BaseTagCompiler extends AbstractCompiler<Tag> {
    static type = NodeType.Tag
}

export class TagCompiler extends BaseTagCompiler {
    static create (node: SleetNode, stack: SleetStack): Compiler | undefined {
        return
    }

    compile (ctx: Context) {
    }
}
