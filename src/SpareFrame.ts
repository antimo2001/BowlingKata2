import debug from 'debug';
import { Frame } from '../src/Frame';

const debugFip = debug("src:SpareFrame");

export class SpareFrame extends Frame {
    constructor(...throws: number[]) {
        super(...throws);
        this.bonusThrows = [];
        //A spare should only use the first throw; the 2nd throw is inferred
        this.base = [throws[0], 10 - throws[0]];
        this.score = 0;
        this.isScored = false;
    }

    /**
     * Returns true iff this Spare frame has enough bonus throws to be scored
     * @override Frame.canScore
     */
    public canScore(): boolean {
        return this.bonusThrows.length >= 1;
    }

    /**
     * Concats the bonus on to this Spare frame
     * @param bonusThrows the rest args to be used as the bonus throws
     * @override Frame.setBonusThrows
     */
    public setBonusThrows(...bonusThrows: number[]): Frame {
        this.bonusThrows = bonusThrows.slice(0, 1);
        return this;
    }

    /**
     * Set the score for this Spare
     * @override Frame.setScore
     */
    protected setScore(): Frame {
        if (!this.canScore()) {
            debugFip(`didnt set the score`);
            return this;
        }
        const baseScore = this.base.slice(0, 2);
        const bonusScore = this.bonusThrows.slice(0, 1);
        this.score = Frame.sum(...[...baseScore, ...bonusScore]);
        this.isScored = true;
        return this;
    }
}