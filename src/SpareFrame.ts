import debug from 'debug';
import { Utility } from '../src/Utility';
import { Frame } from '../src/Frame';
import { BowlingGameError } from '../src/BowlingGameError';

const debugFip = debug("src:SpareFrame");

export class SpareFrame extends Frame {

    constructor(...throws: number[]) {
        super(...throws);
        //A spare should only use the first throw; the 2nd throw is inferred
        const t = throws[0];
        this.base = [t, 10 - t];
    }

    /**
     * Concats the bonus on to this Spare frame
     * @param bonusThrows the rest args to be used as the bonus throws
     * @overrides Frame.setBonusThrows
     */
    setBonusThrows(...bonusThrows: number[]): void {
        this.bonusThrows = bonusThrows.slice(0, 1);
    }

    /**
     * Raise errors if the throws for this spare are invalid.
     * @param throws numbers for the throws of this spare frame
     * @overrides Frame.validateThrows
     */
    public validateThrows(): boolean {
        const firstThrow = this.base[0];
        if (firstThrow < 0) {
            const msg = `throw cannot be negative: ${firstThrow}`;
            debugFip(msg);
            throw new BowlingGameError(msg);
        }
        if (firstThrow >= Frame.MAX_PINS) {
            const msg = `first throw of a spare cannot exceed ${Frame.MAX_PINS} pins`;
            debugFip(msg);
            throw new BowlingGameError(msg);
        }
        //No errors so return true
        return true;
    }

    /**
     * Returns true iff this Spare frame has enough bonus throws to be scored
     * @overrides Frame.canScore
     */
    protected canScore(): boolean {
        return this.bonusThrows.length >= 1;
    }

    /**
     * Set the score for this Spare
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