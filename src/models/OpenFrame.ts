import debug from 'debug';
import { Utility } from '../Utility';
import { Frame } from './Frame';
import { BowlingGameError } from './BowlingGameError';
const debugFip = debug('src:OpenFrame');

export class OpenFrame extends Frame {

    constructor(...throws: number[]) {
        super(...throws);
        this._base = throws.slice(0, 2);
    }

    /**
     * Sets the bonusThrows, but for open frames, this is irrelevent.
     * @overrides Frame.setBonusThrows
     */
    setBonusThrows(): void {
        if (!this.hasBeenScored) {
            this._bonusThrows = [];
        } else {
            debugFip(`system cannot reset the bonus after frame has been scored`);
        }
    }

    /**
     * Raise errors if the throws for this open frame are invalid. Returns true
     * if no errors were raised.
     * @overrides Frame.validateThrows
     */
    validateThrows(): boolean {
        super.validateThrows();
        const [ firstThrow, secondThrow ] = this._base;

        if (firstThrow + secondThrow >= Frame.MAX_PINS) {
            const msg = `2 throws cannot exceed ${Frame.MAX_PINS} pins`;
            debugFip(msg);
            throw new BowlingGameError(msg);
        }
        if (this._base.some(t => t < 0)) {
            const msg = `throw cannot be negative`;
            debugFip(msg);
            throw new BowlingGameError(msg);
        }
        return true;
    }

    /**
     * Sets the score for this open frame. Returns true if the score is set
     * or false if the score is not set.
     * @overrides Frame.setScore
     */
    protected setScore(): boolean {
        const canScore = this._base.length > 1;
        if (!canScore) {
            debugFip(`cannot score yet: ${this._base.length}`);
            return false;
        }
        if (this._hasBeenScored) {
            debugFip(`already done scoring; keep score as is: ${this._score}`);
            return false;
        }
        this._score = Utility.sumApply(this._base);
        return true;
    }
}