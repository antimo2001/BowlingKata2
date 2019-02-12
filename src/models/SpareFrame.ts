import debug from 'debug';
import { Utility } from '../Utility';
import { Frame } from './Frame';
import { BowlingGameError } from './BowlingGameError';

const debugFip = debug("src:SpareFrame");

export class SpareFrame extends Frame {

    constructor(...throws: number[]) {
        super(...throws);

        //A spare should only use the first throw; the 2nd throw is inferred
        const t1 = throws[0];
        const t2 = Frame.MAX_PINS - t1;
        this._base = [t1, t2];
    }

    /**
     * Concats the bonus on to this Spare frame
     * @param bonusThrows the rest args to be used as the bonus throws
     * @overrides Frame.setBonusThrows
     */
    setBonusThrows(...bonusThrows: number[]): void {
        this._bonusThrows = bonusThrows.slice(0, 1);
        this.validateBonus();
    }

    /**
     * Raise errors if the throws for this spare are invalid.
     * @param throws numbers for the throws of this spare frame
     * @overrides Frame.validateThrows
     */
    validateThrows(): boolean {
        super.validateThrows();

        if (this._base[0] >= Frame.MAX_PINS) {
            const msg = `first throw of a spare cannot exceed ${Frame.MAX_PINS} pins`;
            debugFip(msg);
            throw new BowlingGameError(msg);
        }
        if (this._base.some(t => t < 0)) {
            const msg = `throw cannot be negative`;
            debugFip(msg);
            throw new BowlingGameError(msg);
        }
        //No errors so return true
        return true;
    }

    /**
     * Set the score for this Spare
     * @overrides Frame.setScore
     */
    protected setScore(): void {
        const canScore = this._bonusThrows.length >= 1;
        if (!canScore) {
            return;
        }
        if (this._hasBeenScored) {
            debugFip(`already done scoring; keep score as is: ${this._score}`);
            return;
        }
        this._score = Utility.sumApply([...this._base, ...this._bonusThrows]);
        this._hasBeenScored = true;
    }

    /**
     * Raises errors if the bonusThrows is invalid. Returns true if no errors.
     */
    private validateBonus(): boolean {
        const bonus = this._bonusThrows[0];
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