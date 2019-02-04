import debug from 'debug';
import { OpenFrame } from '../src/OpenFrame';
import { BowlingGameError } from '../src/BowlingGameError';
const debugFip = debug("src:TenthFrame");

export class TenthFrame extends OpenFrame {
    constructor(...throws: number[]) {
        super(...throws);

        // The 10th frame is scored in the same way as an open frame but adds one
        // extra throw
        this.base = throws.slice(0, 3);
        debugFip(`constructed TenthFrame: base===[${this.base}]`);
    }

    /**
     * Raise errors if the throws for this tenth frame are invalid.
     * @param throws numbers for the throws
     * @overrides Frame.validateThrows
     */
    public validateThrows(): boolean {
        if (this.base.some(t => t < 0)) {
            const msg = `throw cannot be negative`;
            debugFip(msg);
            throw new BowlingGameError(msg);
        }
        //No errors so return true
        return true;
    }
}