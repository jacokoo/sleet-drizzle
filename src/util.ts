const fromCode = (a: number) => {
    if (a < 26) {
        return String.fromCharCode(97 + a)
    }
    return String.fromCharCode(65 + a - 26)
}

export class IdGenerator {
    id: number = -1

    get (): string {
        const a = Math.floor(this.id / 52)
        const b = this.id - a * 51

        if (a > 51) {
            return `i${this.id}`
        }

        return `${fromCode(a)}${fromCode(b)}`
    }

    next (): string {
        this.id ++
        return this.get()
    }
}

export class UniqueContainer {
    map: {[id: string]: string} = {}
    idg: IdGenerator

    constructor (idg: IdGenerator) {
        this.idg = idg
    }

    set (value: string): string {
        if (this.map[value]) return this.map[value]
        const id = this.idg.next()
        this.map[value] = id
        return id
    }

    get (): object {
        return Object.keys(this.map).reduce((acc, it) => {
            acc[this.map[it]] = it
            return acc
        }, {})
    }
}

export class Container {
    items: object = {}
    idg: IdGenerator

    constructor (idg: IdGenerator) {
        this.idg = idg
    }

    set (value: string): string {
        const id = this.idg.next()
        this.items[id] = value
        return id
    }

    get (): object {
        return this.items
    }
}

export class Unique {
    items: string[] = []

    put (value: string) {
        if (this.items.indexOf(value) === -1) this.items.push(value)
    }

    get (): string[] {
        return this.items
    }
}
