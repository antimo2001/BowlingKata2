import debug from 'debug';
import { Frame } from '../src/Frame';

const debugTest = debug("test:src:StrikeFrame");

export class StrikeFrame extends Frame {
    constructor(throws: number[]) {
        super(throws);
        this.throws = [...throws, 10];
    }

    /**
    * Overrides the Frame.Score method. Note this only sums the 2 throws in
    * this current frame and the next 2 throws.
    */
    public score(): number {
        let start = this.startingThrow;
        let next = this.throws[start + 1];
        let nextnext = this.throws[start + 2];
        next = !!next ? next : 0;
        nextnext = !!nextnext ? nextnext : 0;
        debugTest(`after: (start,next,nextnext)===(${start},${next},${nextnext})`);
        return this.throws[start] + next + nextnext;
    }
}