import { Frame } from '../src/Frame';

export class BonusFrame extends Frame {
    constructor(throws: number[]) {
        super(throws);
    }

    /**
    * Overrides the Frame.Score method.
    */
    public score(): number {
        return 0;
    }
}