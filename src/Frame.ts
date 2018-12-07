export class Frame {
    throws: number[];
    startingThrow: number;

    constructor(throws: number[]) {
        this.throws = throws;
        this.startingThrow = throws.length;
    }

    public score(): number {
        throw "Frame.score is abstract method; it cannot be directly invoked";
        // return -1;
    }
}