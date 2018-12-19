import { Frame } from '../src/Frame';

export class TenthFrame extends Frame {
    constructor(frameIndex: number, ...throws: number[]) {
        super(frameIndex, ...throws);
    }

    /** Overrides the Frame.Score method */
    public setScore(): Frame {
        super.setScore();
        return this;
    }
}