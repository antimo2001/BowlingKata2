import { Frame } from '../src/Frame';

export class OpenFrame extends Frame {
    constructor(throws: number[], firstThrow: number, secondThrow: number) {
        super(throws);
        this.throws = [...throws, firstThrow, secondThrow];
        // this.startingThrow = this.throws.length;
    }

    /**
    * Overrides the Frame.Score method. Note this only sums the 2 throws in
    * this current frame and _not_ the running total sum of frames.
    */
    public score(): number {
        let start = this.startingThrow;
        let t = this.throws;
        return t[start] + t[start+1];
    }
}