interface Declaration {
    name: string,
    extension: string,
    option (key: string): string
}

type AttributeType = ''
type ValueMajorType = 'helper'
type ValueMinorType = 'quoted' | 'number' | 'boolean' | 'identifier' | 'helper'

interface Value {

}

interface Attribute {

}
