export class Frame {
    // protected throws: number[];
    protected frameIndex: number;

    constructor(frameIndex: number) {
        // this.throws = throws;
        this.frameIndex = frameIndex;
    }

    public score(throws: number[]): number {
        throw "Frame.score is abstract method; it cannot be directly invoked";
    }
}