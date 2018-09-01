import { SleetStack, Context, Tag } from 'sleet';
export declare function put(stack: SleetStack, name: string): void;
export declare function next(stack: SleetStack): string;
export declare function id(stack: SleetStack): string;
export declare function compileNodes(ctx: Context, stack: SleetStack, tags: Tag[]): string[];
