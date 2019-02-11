import debug from 'debug';
import { Utility } from './Utility';
import { Frame } from './Frame';
import { BowlingGameError } from './BowlingGameError';

const debugFip = debug("src:SpareFrame");

export class SpareFrame extends Frame {

    constructor(...throws: number[]) {
        super(...throws);
        //A spare should only use the first throw; the 2nd throw is inferred
        const t1 = throws[0];
        const t2 = Frame.MAX_PINS - t1;
        this.base = [t1, t2];
    }

    /**
     * Concats the bonus on to this Spare frame
     * @param bonusThrows the rest args to be used as the bonus throws
     * @overrides Frame.setBonusThrows
     */
    setBonusThrows(...bonusThrows: number[]): void {
        this.bonusThrows = bonusThrows.slice(0, 1);
        this.validateBonus();
    }

    /**
     * Raise errors if the throws for this spare are invalid.
     * @param throws numbers for the throws of this spare frame
     * @overrides Frame.validateThrows
     */
    public validateThrows(): boolean {
        super.validateThrows();

        if (this.base[0] >= Frame.MAX_PINS) {
            const msg = `first throw of a spare cannot exceed ${Frame.MAX_PINS} pins`;
            debugFip(msg);
            throw new BowlingGameError(msg);
        }
        if (this.base.some(t => t < 0)) {
            const msg = `throw cannot be negative`;
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

    /**
     * Raises errors if the bonusThrows is invalid. Returns true if no errors.
     */
    private validateBonus(): boolean {
        const bonus = this.bonusThrows[0];
        const validations = [{
            fails: (bonus !== 0 && !bonus),
            message: `bonus of a spare cannot be undefined`
        }, {
            fails: (bonus < 0),
            message: `bonus cannot be negative`
        }, {
            fails: (bonus > Frame.MAX_PINS),
            message: `bonus cannot exceed ${Frame.MAX_PINS} pins`
        }];
        for (let { fails, message } of validations) {
            if (fails) {
                debugFip(message);
                throw new BowlingGameError(message);
            }
        }
        return true;
    }
}