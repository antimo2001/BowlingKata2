import debug from 'debug';
import { Frame } from '../src/Frame';
const debugTest = debug("src:OpenFrame");

export class OpenFrame extends Frame {
    constructor(frameIndex: number) {
        super(frameIndex);
        // this.throws = [...throws, firstThrow, secondThrow];
    }

    /**
    * Overrides the Frame.Score method. Note this only sums the 2 throws in
    * this current frame and _not_ the running total sum of frames.
    */
    public score(throws: number[]): number {
        let fi = this.frameIndex;
        // debugTest(`start==${start}`);
        debugTest(`throws==${throws}`);
        let current = !!throws[fi]? throws[fi]: 0;
        let next = !!throws[fi+1]? throws[fi+1]: 0;
        return current + next;
    }
}