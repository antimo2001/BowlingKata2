import debug from 'debug';
import { Frame } from '../src/Frame';
import { OpenFrame } from '../src/OpenFrame';
import { BowlingGameError } from '../src/BowlingGameError';
const debugFip = debug("src:TenthFrame");

export class TenthFrame extends OpenFrame {
    constructor(...throws: number[]) {
        super(...throws);
        //The 10th frame is scored in a special way (not based on bonusThrows)
        this.base = throws.slice(0, 3);
        debugFip(`constructed TenthFrame: base===[${this.base}]`);
    }

    /**
     * Raise errors if the throws for this tenth frame are invalid.
     * @param throws numbers for the throws
     * @overrides Frame.validateThrows
     */
    public validateThrows(...throws: number[]): void {
        if (throws.some(t => t < 0)) {
            const msg = `throw cannot be negative`;
            debugFip(msg);
            throw new BowlingGameError(msg);
        }
    }
}