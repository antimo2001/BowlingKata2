import debug from 'debug';
import { Frame } from '../src/Frame';
const debugTest = debug("test:src:OpenFrame");

export class OpenFrame extends Frame {
    constructor(throws: number[], firstThrow: number, secondThrow: number) {
        super(throws);
        this.throws = [...throws, firstThrow, secondThrow];
    }

    /**
    * Overrides the Frame.Score method. Note this only sums the 2 throws in
    * this current frame and _not_ the running total sum of frames.
    */
    public score(): number {
        let start = this.startingThrow;
        let t = this.throws;
        // debugTest(`start==${start}`);
        // debugTest(`t==${t}`);
        let current = !!t[start]? t[start]: 0;
        let next = !!t[start+1]? t[start+1]: 0;
        return current + next;
    }
}