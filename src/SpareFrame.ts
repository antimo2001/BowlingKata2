import debug from 'debug';
import { Frame } from '../src/Frame';

const debugFip = debug("src:SpareFrame");

export class SpareFrame extends Frame {
    constructor(...throws: number[]) {
        super(...throws);
        //A spare should only use the first throw; the 2nd throw is inferred
        this.base = [throws[0], 10 - throws[0]];
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
     * Returns true iff this Spare frame has enough bonus throws to be scored
     * @override Frame.canScore
     */
    protected canScore(): boolean {
        return this.bonusThrows.length >= 1;
    }

    /**
     * Set the score for this Spare
     * @override Frame.setScore
     */
    protected setScore(): Frame {
        if (!this.canScore()) {
            // debugFip(`didnt set the score: bonusThrows.length===${this.bonusThrows.length}`);
            return this;
        }
        if (this.isScored) {
            debugFip(`already done scoring; keep score as is: ${this.score}`);
            return this;
        }
        this.score = Frame.sumApply([...this.base, ...this.bonusThrows]);
        this.isScored = true;
        return this;
    }
}