import { Frame } from '../src/Frame';

export class SpareFrame extends Frame {
    constructor(throws: number[], firstThrow: number) {
        super(throws);
        this.throws = [...throws, firstThrow, 10 - firstThrow];
    }

    /**
    * Overrides the Frame.Score method. Note this only sums the 2 throws in
    * this current frame and the next throw.
    */
    public score(): number {
        let start = this.startingThrow;
        let next = this.throws[start + 2];
        next = !!next ? next : 0;
        return 10 + next;
    }
}