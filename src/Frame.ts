export class Frame {
    protected throws: number[];
    public startingThrow: number;

    constructor(throws: number[]) {
        this.throws = throws;
        this.startingThrow = throws.length;
    }

    public getThrows(): number[] {
        return this.throws;
    }

    public setThrows(throws: number[]): void {
        this.throws = throws;
    }

    public score(): number {
        throw "Frame.score is abstract method; it cannot be directly invoked";
        // return -1;
    }
}