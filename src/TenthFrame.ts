import debug from 'debug';
import { OpenFrame } from '../src/OpenFrame';
import { BowlingGameError } from '../src/BowlingGameError';
const debugFip = debug("src:TenthFrame");

export class TenthFrame extends OpenFrame {
    constructor(...throws: number[]) {
        super(...throws);

        // The 10th frame is scored in the same way as an open frame
        this.base = throws.slice(0, 3);
    }

    /**
     * Raise errors if the throws for this tenth frame are invalid.
     * @param throws numbers for the throws
     * @overrides Frame.validateThrows
     */
    public validateThrows(): boolean {
        const MAX_PINS = OpenFrame.MAX_PINS;
        const [ t1, t2, t3 ] = this.base;
        const assertions = [{
            fails: this.base.some(t => isNaN(t)),
            message: `throw cannot be NaN`
        } , {
            fails: this.base.some(t => t < 0),
            message: `throw cannot be negative`
        } , {
            fails: t1 + t2 >= MAX_PINS && t3 === undefined,
            message: `the 3rd throw cannot be undefined`
        } , {
            fails: t1 + t2 < MAX_PINS && t3 !== undefined,
            message: `the 3rd throw is not allowed since first throws are too low`
        }];
        for (let { fails, message } of assertions) {
            if (fails) {
                debugFip(message);
                throw new BowlingGameError(message);
            }
        }
        //No errors so return true
        return true;
    }
}