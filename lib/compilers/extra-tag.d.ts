import { AbstractCompiler, Tag, Context } from 'sleet';
export declare class EachTagCompiler extends AbstractCompiler<Tag> {
    compile(context: Context, elseBlock: Tag): any;
}
export declare class IfTagCompiler extends AbstractCompiler<Tag> {
    compile(ctx: Context, ...elseBlocks: Tag[]): string;
}
