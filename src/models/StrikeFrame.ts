import debug from 'debug';
import { Utility } from '../Utility';
import { Frame } from './Frame';
import { BowlingGameError } from './BowlingGameError';

const debugFip = debug("src:StrikeFrame");

export class StrikeFrame extends Frame {

    constructor(...throws: number[]) {
        super(...throws);
        //A strike is assumed to be 10 pins
        this._base = [Frame.MAX_PINS];
    }

    /**
     * Concats the bonus on to this Strike frame
     * @param bonusThrows the rest args to be used as the bonus throws
     * @overrides Frame.setBonusThrows
     */
    setBonusThrows(...bonusThrows: number[]): void {
        this._bonusThrows = bonusThrows.slice(0, 2);
        this.validateBonus();
    }

    /**
     * Raise errors if the throws for this strike are invalid.
     * @param throws numbers for the throws
     * @overrides Frame.validateThrows
     */
    validateThrows(): boolean {
        super.validateThrows();
        debugFip(`No other validations, so dont raise errors`);
        return true;
    }

    /**
     * Returns true iff this Strike frame has enough bonus throws to be scored
     * @overrides Frame.canScore
     */
    protected canScore(): boolean {
        return this._bonusThrows.length >= 2;
    }

    /**
     * Sets the score for this Strike. Returns true if the score is set or false
     * if the score is not set.
     * @overrides Frame.setScore
     */
    protected setScore(): boolean {
        if (!this.canScore()) {
            return false;
        }
        if (this._hasBeenScored) {
            debugFip(`already done scoring; keep score as is: ${this._score}`);
            return false;
        }
        this._score = Utility.sumApply([...this._base, ...this._bonusThrows]);
        return true;
    }

    /**
     * Raises errors if the bonusThrows is invalid. Returns true if no errors.
     */
    private validateBonus(): boolean {
        const bonus = this._bonusThrows;
        const validations = [{
            fails: (bonus.some(b => b !== 0 && !b)),
            message: `bonus of a strike cannot be undefined`
        }, {
            fails: (bonus.some(b => b < 0)),
            message: `bonus cannot be negative`
        }, {
            fails: (bonus.some(b => b > Frame.MAX_PINS)),
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