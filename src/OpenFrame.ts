import debug from 'debug';
import { Utility } from '../src/Utility';
import { Frame } from '../src/Frame';
import { BowlingGameError } from '../src/BowlingGameError';
const debugFip = debug('src:OpenFrame');

export class OpenFrame extends Frame {

    constructor(...throws: number[]) {
        super(...throws);
        this.base = throws.slice(0, 2);
    }

    /**
     * Raise errors if the throws for this open frame are invalid.
     * @param throws numbers for the throws
     * @overrides Frame.validateThrows
     */
    public validateThrows(...throws: number[]): void {
        const [ firstThrow, secondThrow ] = throws;
        //Throw error if invalid sum of throws
        if (firstThrow + secondThrow >= Frame.MAX_PINS) {
            const msg = `2 throws cannot exceed ${Frame.MAX_PINS} pins`;
            debugFip(msg);
            throw new BowlingGameError(msg);
        }
        if (throws.some(t => t < 0)) {
            const msg = `throw cannot be negative`;
            debugFip(msg);
            throw new BowlingGameError(msg);
        }
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