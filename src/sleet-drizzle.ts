export function overrideContext (
    context: Sleet.Context,
    options: Sleet.PluginOption & Sleet.CompileOption,
    declaration: Sleet.Declaration) {

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
        console.log(tags)
    }

    context.getOutput = () => {
        return 'hello'
    }
}
