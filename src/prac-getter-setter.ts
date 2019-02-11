import debug from 'debug'

const debugFip = debug('src:prac-getter-setter')

/**
 * Class is for practicing getters and setters of properties.
 *
 * Found a helpful question on stackoverflow:
 * https://stackoverflow.com/questions/12827266/get-and-set-in-typescript
 *
 * Also, see the official typescript docs: http://www.typescriptlang.org/docs/handbook/classes.html
 */
class Greeter {
    private _name: string

    constructor() {
        this._name = "unnamed"
    }

    /**
     * Get the name of this greeter or set its value
     */
    public get name() : string {
        return this._name
    }
    public set name(v : string) {
        this._name = v
    }

    /**
     * Example of invoking the getter
     */
    public hello(): string {
        return `Hello, ${this.name}`
    }

}

/**
 * ----------------------------------- MAIN -----------------------------------
 */
{
    const greeter = new Greeter()
    greeter.name = 'Alice'
    debugFip(greeter.hello())
}