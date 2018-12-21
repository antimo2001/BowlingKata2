import debug from 'debug';
import { Frame } from '../src/Frame';

const debugFip = debug("src:StrikeFrame");

export class StrikeFrame extends Frame {
    constructor(...throws: number[]) {
        super(...throws);
        this.bonusThrows = [];
        //A strike is assumed to be 10 pins
        this.base = [10];
        this.score = 0;
        this.isScored = false;
    }

    /**
     * Concats the bonus on to this Strike frame
     * @param bonusThrows the rest args to be used as the bonus throws
     * @override Frame.setBonusThrows
     */
    public setBonusThrows(...bonusThrows: number[]): Frame {
        this.bonusThrows = bonusThrows.slice(0, 2);
        return this;
    }

    /**
     * Returns true iff this Strike frame has enough bonus throws to be scored
     * @override Frame.canScore
     */
    protected canScore(): boolean {
        return this.bonusThrows.length >= 2;
    }

    /**
     * Set the score for this Strike
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
        const baseScore = this.base.slice(0, 1);
        const bonusScore = this.bonusThrows.slice(0, 2);
        // debugFip(`is baseScore still just 10? ${this.base[0]===10? 'yes': 'OMG NO'}`);
        this.score = Frame.sum(...[...baseScore, ...bonusScore]);
        this.isScored = true;
        return this;
    }

}