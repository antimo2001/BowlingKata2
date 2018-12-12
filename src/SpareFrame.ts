import debug from 'debug';
import { Frame } from '../src/Frame';

const debugTest = debug("src:SpareFrame");

export class SpareFrame extends Frame {
    constructor(frameIndex: number) {
        super(frameIndex);
        // this.throws = [...throws, firstThrow, 10 - firstThrow];
    }

    /**
    * Overrides the Frame.Score method. Note this only sums the 2 throws in
    * this current frame and the next throw.
    */
    public score(throws: number[]): number {
        let fi = this.frameIndex;
        // debugTest(`start==${start}`);
        // debugTest(`this.throws.length==${this.throws.length}`);
        let next = throws[fi + 2];
        next = !!next ? next : 0;
        debugTest(`next==${next}; and is NAN? ${(next===NaN)}`);
        return 10 + next;
    }
}