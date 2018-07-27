declare namespace Sleet {

    interface Declaration {
        name: string,
        extension: string,
        option (key: string): string
    }

    type ElementType = 'tag' | 'attribute' | 'group' | 'setting' | 'value'
    type AttributeMajorType = 'helper' | 'setting'
    type ValueMinorType = 'quoted' | 'number' | 'boolean' | 'identifier' | 'helper'

    interface Value {
        type: ElementType
        major: AttributeMajorType
        minor: ValueMinorType
        value: number | string | boolean | Helper
    }

    interface Helper extends Value {
        name: string,
        attributes: Attribute[]
    }

    interface Attribute {
        namespace?: string
        name?: string
        value: Value[]
    }

    interface AttributeSetting {
        name: string
        attributes: Attribute[]
    }

    interface AttributeGroup {
        attributes: Attribute[]
        setting: AttributeSetting
    }

    type InlineChar = ':' | '>' | '<' | '+'

    interface Tag {
        indent: number
        name?: string
        namespace: string
        dots: string[]
        hash: string
        children: Tag[]
        inlineChar: InlineChar
        inlines: Tag[]
        attributeGroups: AttributeGroup[]
        parent: Tag
        firstAttribute?: Attribute
        text: string[]
    }

    interface Plugin {
        overrideContext (context: Context, options: PluginOption & CompileOption, declaration: Declaration)
    }

    interface PluginOption {
        [name: string]: Plugin
    }

    interface CompileOption{
        indentToken?: string
        extension?: string
    }

    interface Context {
        doCompile (tags: Tag[]): void
        getOutput (): string
    }

    interface Sleet {
        compile (source: string, options: PluginOption & CompileOption)
    }

}
