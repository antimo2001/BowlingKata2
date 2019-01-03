import { Frame } from '../src/Frame';

export class BonusFrame extends Frame {
    constructor(frameIndex: number) {
        super(frameIndex);
        throw 'deprecated class';
    }
    public getScore(): number {
        throw 'deprecated class';
    }
}