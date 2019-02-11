/**
 * Class is for practicing getters and setters of properties.
 * Found a helpful question on stackoverflow: https://stackoverflow.com/questions/12827266/get-and-set-in-typescript
 */
export class Greeter {
    private _name: string;

    constructor() {
        this._name = "";
    }

    /**
     * Get the name of this greeter or set its value
     */
    public get name() : string {
        return this._name;
    }
    public set name(v : string) {
        this._name = v;
    }

    /**
     * Example of invoking the getter
     */
    public hello(): string {
        return `Hello, ${this.name}`;
    }

}