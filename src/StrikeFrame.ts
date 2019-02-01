import debug from 'debug';
import { Utility } from '../src/Utility';
import { Frame } from '../src/Frame';

const debugFip = debug("src:StrikeFrame");

export class StrikeFrame extends Frame {
    constructor(...throws: number[]) {
        super(...throws);
        //A strike is assumed to be 10 pins
        this.base = [10];
    }

    /**
     * Concats the bonus on to this Strike frame
     * @param bonusThrows the rest args to be used as the bonus throws
     * @overrides Frame.setBonusThrows
     */
    public setBonusThrows(...bonusThrows: number[]): Frame {
        this.bonusThrows = bonusThrows.slice(0, 2);
        return this;
    }

    /**
     * Returns true iff this Strike frame has enough bonus throws to be scored
     * @overrides Frame.canScore
     */
    protected canScore(): boolean {
        return this.bonusThrows.length >= 2;
    }

    /**
     * Set the score for this Strike
     * @overrides Frame.setScore
     */
    protected setScore(): Frame {
        if (!this.canScore()) {
            // debugFip(`didnt set the score: bonusThrows.length===${this.bonusThrows.length}`);
            return this;
        }
        if (this.hasBeenScored) {
            debugFip(`already done scoring; keep score as is: ${this.score}`);
            return this;
        }
        this.score = Utility.sumApply([...this.base, ...this.bonusThrows]);
        this.hasBeenScored = true;
        return this;
    }
}