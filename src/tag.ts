export interface Tag {
    name: string,
    id?: string
    attributes?: Sleet.Attribute[]
    setting?: Sleet.AttributeSetting
    parent?: Tag
    children: Tag[],
    sleet: Sleet.Tag
}

export class DrizzleTag implements Tag {
    name: string
    id: string
    attributes: Sleet.Attribute[] = []
    setting: Sleet.AttributeSetting
    parent: Tag
    children: Tag[] = []

    sleet: Sleet.Tag

    constructor (tag: Sleet.Tag, parent: Tag) {
        this.parent = parent
        this.name = tag.name || 'div'
        this.id = tag.hash || null
        this.sleet = tag

        this.initAttributes()
        this.initChildren()

        if (this.sleet.dots && this.sleet.dots.length) {
            const ds = this.sleet.dots.map(it => {
                return {type: 'value', major: '', minor: 'quoted', value: it} as Sleet.Value
            })
            const at = this.attributes.find(it => it.name === 'class')
            if (at) {
                ds.forEach(it => at.value.push(it))
            } else {
                this.attributes.push({name: 'class', value: ds} as Sleet.Attribute)
            }
        }
    }

    initChildren () {
        this.children = this.sleet.children.map(it => new DrizzleTag(it, this))
        if (this.sleet.text.length && this.name !== '|') {
            this.children.unshift(new DrizzleTag({
                name: '|',
                text: this.sleet.text,
                children: [],
                indent: 0,
                dots: [],
                inlines: []
            }, this))
        }

        let c
        let p = this
        let haveInlineChild = false
        this.sleet.inlines.forEach((it, i) => {
            if (it.inlineChar === '>' || it.inlineChar === ':') {
                c = new DrizzleTag(it, p)
                p.children.push(c)
                p = c
                haveInlineChild = true
                return
            }

            if (it.inlineChar === '+') {
                c = new DrizzleTag(it, p.parent)
                p.parent.children.push(c)
                p = c
                return
            }

            if (it.inlineChar === '<' && haveInlineChild) {
                c = new DrizzleTag(it, p.parent.parent)
                p.parent.parent.children.push(c)
                p = c
                return
            }

            throw new SyntaxError(`Invalid inline char: ${it.inlineChar} in Tag: ${it.name}`)
        })
    }

    initAttributes () {
        if (this.sleet.attributeGroups) {
            const vs = this.sleet.attributeGroups.filter(it => !!it.setting)
            if (vs.length > 1) {
                throw new SyntaxError(`a tag should only have one attribute group setting`)
            }

            if (vs.length) {
                this.setting = vs[0].setting
                this.sleet.attributeGroups.forEach(it => {
                    if (it !== vs[0]) vs[0].merge(it)
                })
                this.attributes = vs[0].attributes
            } else {
                const g0 = this.sleet.attributeGroups[0]
                this.sleet.attributeGroups.slice(1).forEach(it => g0.merge(it))
                this.attributes = g0.attributes
            }
        }
    }
}
