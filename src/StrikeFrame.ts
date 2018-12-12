import debug from 'debug';
import { Frame } from '../src/Frame';

const debugTest = debug("src:StrikeFrame");

export class StrikeFrame extends Frame {
    constructor(frameIndex: number) {
        super(frameIndex);
        // this.throws = [...throws, 10];
    }

    /**
    * Overrides the Frame.Score method. Note this only sums the 2 throws in
    * this current frame and the next 2 throws.
    */
    public score(throws: number[]): number {
        let start = this.frameIndex;
        let next = throws[start + 1];
        let nextnext = throws[start + 2];
        next = !!next ? next : 0;
        nextnext = !!nextnext ? nextnext : 0;
        debugTest(`after: (start,next,nextnext)===(${start},${next},${nextnext})`);
        return throws[start] + next + nextnext;
    }
}