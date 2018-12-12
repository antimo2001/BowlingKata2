import { Frame } from '../src/Frame';

export class BonusFrame extends Frame {
    constructor(frameIndex: number) {
        super(frameIndex);
    }

    /**
    * Overrides the Frame.Score method.
    */
    public score(throws: number[]): number {
        return 0;
    }
}