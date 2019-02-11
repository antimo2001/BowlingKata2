import debug from 'debug';
import { Utility } from '../Utility';
import { Frame } from './Frame';
import { BowlingGameError } from './BowlingGameError';
const debugFip = debug('src:OpenFrame');

export class OpenFrame extends Frame {

    constructor(...throws: number[]) {
        super(...throws);
        this.base = throws.slice(0, 2);
    }

    /**
     * Raise errors if the throws for this open frame are invalid. Returns true
     * if no errors were raised.
     * @overrides Frame.validateThrows
     */
    public validateThrows(): boolean {
        super.validateThrows();
        const [ firstThrow, secondThrow ] = this.base;

        if (firstThrow + secondThrow >= Frame.MAX_PINS) {
            const msg = `2 throws cannot exceed ${Frame.MAX_PINS} pins`;
            debugFip(msg);
            throw new BowlingGameError(msg);
        }
        if (this.base.some(t => t < 0)) {
            const msg = `throw cannot be negative`;
            debugFip(msg);
            throw new BowlingGameError(msg);
        }
        return true;
    }

    /**
     * Returns true iff this Open frame has enough base throws to be scored
     * @overrides Frame.canScore
     */
    protected canScore(): boolean {
        return this.base.length > 1;
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
        this.score = Utility.sumApply(this.base);
        this.hasBeenScored = true;
        return this;
    }
}