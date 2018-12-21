import debug from 'debug';
import { Frame } from '../src/Frame';
const debugFip = debug("src:TenthFrame");

export class TenthFrame extends Frame {
    constructor(...throws: number[]) {
        super(...throws);
        this.bonusThrows = [];
        //The 10th frame is scored in a special way (not based on bonusThrows)
        this.base = throws;
        this.score = 0;
        this.isScored = false;
    }

    /**
     * Concats the bonus on to this tenth frame
     * @param bonusThrows the rest args to be used as the bonus throws
     * @override Frame.setBonusThrows
     */
    public setBonusThrows(...bonusThrows: number[]): Frame {
        // this.bonusThrows = bonusThrows.slice(0, 1);
        // const baseScore = this.base.slice(0, 2);
        // const gotSpare = (baseScore[0] + baseScore[1]) === 10;
        // const gotStrike = baseScore[0] === 10;
        // let bonusScore: number[] = [0];
        // bonusScore = gotSpare ? baseScore.slice(2, 3) : bonusScore;
        // bonusScore = gotStrike ? baseScore.slice(1, 3) : bonusScore;
        // this.bonusThrows = bonusScore;
        return this;
    }

    /**
     * Returns true iff this Spare frame has enough bonus throws to be scored
     * @override Frame.canScore
     */
    protected canScore(): boolean {
        return this.bonusThrows.length >= 0;
    }

    /**
     * Set the score for this Spare
     * @override Frame.setScore
     */
    protected setScore(): Frame {
        if (!this.canScore()) {
            debugFip(`didnt set the score: bonusThrows.length===${this.bonusThrows.length}`);
            return this;
        }
        this.score = Frame.sum(...this.base);
        this.isScored = true;
        return this;
    }
}