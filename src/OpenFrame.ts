import debug from 'debug';
import { Frame } from '../src/Frame';
const debugFip = debug("src:OpenFrame");

export class OpenFrame extends Frame {
    constructor(...throws: number[]) {
        super(...throws);
    }

    /**
    * Overrides the Frame.Score method. Note this only sums the 2 throws in
    * this current frame and _not_ the cumulative total sum of frames.
    */
    public getScore(): number {
        return super.getScore();
    }
}